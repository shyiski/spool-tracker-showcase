import bcrypt from 'bcryptjs';
import { userRepo, backupCodesRepo, authLogsRepo } from '../db/index.js';
import {
  generateAuthToken,
  generateTemp2FAToken,
  verifyTemp2FAToken
} from '../middleware/authMiddleware.js';
import {
  generateTwoFactorSecret,
  verifyTwoFactorCode,
  generateBackupCodes,
  verifyBackupCode
} from './totpService.js';
import { bruteForceService } from './bruteForceService.js';

function validatePassword(password) {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter (A-Z)');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`§±]/.test(password)) {
    throw new Error('Password must contain at least one special character or symbol (!@#$...)');
  }
}

function logEvent(userId, action, reqInfo = {}, details = '') {
  return authLogsRepo.create({
    userId: userId || null,
    action,
    ip: reqInfo.ip || null,
    userAgent: reqInfo.userAgent || null,
    details
  });
}

export const authService = {
  async register({ email, password, username, reqInfo = {} }) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    validatePassword(password);

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await userRepo.findByEmail(cleanEmail);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const finalUsername = (username && username.trim()) ? username.trim() : cleanEmail.split('@')[0];

    const newUser = await userRepo.create({
      email: cleanEmail,
      username: finalUsername,
      passwordHash
    });

    await logEvent(newUser.id, 'REGISTER', reqInfo, `User registered: ${newUser.email}`);
    const token = generateAuthToken(newUser);

    return { user: newUser, token };
  },

  async loginGoogle({ email, name, googleId, avatarUrl, reqInfo = {} }) {
    if (!email) {
      throw new Error('Google account email is required');
    }

    const cleanEmail = email.trim().toLowerCase();
    const { user, isNew } = await userRepo.findOrCreateGoogleUser({
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      googleId,
      avatarUrl
    });

    await logEvent(
      user.id,
      isNew ? 'REGISTER_GOOGLE' : 'LOGIN_GOOGLE',
      reqInfo,
      `Google authentication: ${user.email} (new: ${isNew})`
    );

    const token = generateAuthToken(user);
    return { user, token, isNew };
  },

  async updateProfile(userId, { username, gender, avatarUrl, reqInfo = {} }) {
    if (!userId) {
      throw new Error('User is not authorized');
    }

    if (gender && !['M', 'F'].includes(gender)) {
      throw new Error('Invalid gender. Allowed values: M or F');
    }

    const updatedUser = await userRepo.updateProfile(userId, {
      username: username ? username.trim() : undefined,
      gender: gender || null,
      avatarUrl: avatarUrl || undefined
    });

    await logEvent(
      userId,
      'PROFILE_UPDATED',
      reqInfo,
      `Profile updated: name=${updatedUser.username}, gender=${updatedUser.gender || 'not specified'}`
    );

    return { user: updatedUser };
  },

  async login({ identifier, email, password, reqInfo = {} }) {
    const loginKey = (identifier || email || '').trim();
    if (!loginKey || !password) {
      throw new Error('Username or email and password are required');
    }

    bruteForceService.assertNotLocked(loginKey, reqInfo.ip);

    const user = await userRepo.findByEmailOrUsername(loginKey);
    if (!user) {
      await logEvent(null, 'LOGIN_FAILED', reqInfo, `Login failed: user not found (${loginKey})`);
      await bruteForceService.failAndThrow(loginKey, reqInfo.ip, reqInfo);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await logEvent(user.id, 'LOGIN_FAILED', reqInfo, 'Invalid password attempt');
      await bruteForceService.failAndThrow(loginKey, reqInfo.ip, reqInfo);
    }

    bruteForceService.recordSuccess(loginKey, reqInfo.ip);

    if (user.two_factor_enabled === 1 || user.two_factor_enabled === true) {
      await logEvent(user.id, 'LOGIN_PASSWORD_OK', reqInfo, 'Password verified, waiting for 2FA');

      return {
        requires2FA: true,
        tempToken: generateTemp2FAToken(user.id),
        email: user.email,
        username: user.username
      };
    }

    await logEvent(user.id, 'LOGIN_SUCCESS', reqInfo, 'Password login successful (no 2FA)');

    const safeUser = await userRepo.findById(user.id);
    return {
      requires2FA: false,
      token: generateAuthToken(safeUser),
      user: safeUser
    };
  },

  async verify2FALogin({ tempToken, code, isBackupCode = false, reqInfo = {} }) {
    if (!tempToken || !code) {
      throw new Error('Temporary token and 2FA code are required');
    }

    const payload = verifyTemp2FAToken(tempToken);
    if (!payload) {
      throw new Error('2FA session has expired or is invalid. Please log in again.');
    }

    const user = await userRepo.findByIdWithSecret(payload.userId);
    if (!user) {
      throw new Error('User not found');
    }

    bruteForceService.assertNotLocked(user.email, reqInfo.ip);

    if (isBackupCode) {
      const unusedCodes = await backupCodesRepo.getUnusedCodes(user.id);
      const { valid, backupCodeId } = await verifyBackupCode(code, unusedCodes);

      if (!valid) {
        await logEvent(user.id, '2FA_FAILED', reqInfo, 'Failed 2FA attempt using backup code');
        await bruteForceService.failAndThrow(user.email, reqInfo.ip, reqInfo, 'Invalid or already used backup code.');
      }

      await backupCodesRepo.markAsUsed(backupCodeId);
      await logEvent(user.id, '2FA_SUCCESS', reqInfo, `2FA authenticated via backup code (code id #${backupCodeId})`);
      bruteForceService.recordSuccess(user.email, reqInfo.ip);

      const safeUser = await userRepo.findById(user.id);
      return {
        user: safeUser,
        token: generateAuthToken(safeUser),
        usedBackupCode: true
      };
    }

    const isValid = verifyTwoFactorCode(code, user.two_factor_secret);
    if (!isValid) {
      await logEvent(user.id, '2FA_FAILED', reqInfo, 'Invalid 6-digit TOTP code');
      await bruteForceService.failAndThrow(user.email, reqInfo.ip, reqInfo, 'Invalid 2FA verification code.');
    }

    await logEvent(user.id, '2FA_SUCCESS', reqInfo, '2FA authenticated successfully via TOTP app');
    bruteForceService.recordSuccess(user.email, reqInfo.ip);

    const safeUser = await userRepo.findById(user.id);
    return {
      user: safeUser,
      token: generateAuthToken(safeUser),
      usedBackupCode: false
    };
  },

  async setup2FA(userId) {
    const user = await userRepo.findById(userId);
    if (!user) throw new Error('User not found');

    const { secret, otpauthUri, qrCodeDataUrl } = await generateTwoFactorSecret(user.email);
    await userRepo.saveTemp2FASecret(userId, secret);

    return { secret, otpauthUri, qrCodeDataUrl };
  },

  async confirm2FA(userId, code, reqInfo = {}) {
    const user = await userRepo.findByIdWithSecret(userId);
    if (!user || !user.two_factor_secret) {
      throw new Error('2FA setup was not started');
    }

    const isValid = verifyTwoFactorCode(code, user.two_factor_secret);
    if (!isValid) {
      throw new Error('Invalid code. Please check your device time and try again.');
    }

    await userRepo.enable2FA(userId);
    const { plainCodes, hashedCodes } = await generateBackupCodes(6);
    await backupCodesRepo.replaceCodes(userId, hashedCodes);

    await logEvent(userId, '2FA_ENABLED', reqInfo, '2FA enabled and new backup codes generated');
    const updatedUser = await userRepo.findById(userId);

    return {
      success: true,
      backupCodes: plainCodes,
      user: updatedUser
    };
  },

  async disable2FA(userId, password, reqInfo = {}) {
    const user = await userRepo.findByIdWithSecret(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid password to disable 2FA');
    }

    await userRepo.disable2FA(userId);
    await backupCodesRepo.replaceCodes(userId, []);
    await logEvent(userId, '2FA_DISABLED', reqInfo, '2FA disabled by user');

    const updatedUser = await userRepo.findById(userId);
    return { success: true, user: updatedUser };
  }
};
