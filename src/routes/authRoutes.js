import { Router } from 'express';
import { authService } from '../services/authService.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { backupCodesRepo, userRepo } from '../db/index.js';
import { ipRateLimiter, checkAccountLockout } from '../middleware/rateLimiter.js';
import { setAuthCookie, clearAuthCookie, getRequestInfo, sendError } from '../utils/http.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const result = await authService.register({
      email,
      username,
      password,
      reqInfo: getRequestInfo(req)
    });

    setAuthCookie(res, result.token);
    res.status(201).json({
      message: 'Registration successful',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/google', async (req, res) => {
  try {
    const { email, name, googleId, avatarUrl } = req.body;
    const result = await authService.loginGoogle({
      email,
      name,
      googleId,
      avatarUrl,
      reqInfo: getRequestInfo(req)
    });

    setAuthCookie(res, result.token);
    res.json({
      success: true,
      user: result.user,
      token: result.token,
      isNew: result.isNew,
      message: result.isNew ? 'Google registration successful' : 'Google login successful'
    });
  } catch (error) {
    sendError(res, error);
  }
});

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { username, gender, avatarUrl } = req.body;
    const result = await authService.updateProfile(req.user.id, {
      username,
      gender,
      avatarUrl,
      reqInfo: getRequestInfo(req)
    });

    res.json({
      success: true,
      user: result.user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/login', ipRateLimiter, checkAccountLockout, async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;
    const result = await authService.login({
      identifier: identifier || email || username,
      password,
      reqInfo: getRequestInfo(req)
    });

    if (result.requires2FA) {
      return res.json({
        requires2FA: true,
        tempToken: result.tempToken,
        email: result.email,
        message: 'Two-factor authentication code required'
      });
    }

    setAuthCookie(res, result.token);
    res.json({
      requires2FA: false,
      user: result.user,
      token: result.token,
      message: 'Login successful'
    });
  } catch (error) {
    sendError(res, error, 401);
  }
});

router.post('/verify-2fa', ipRateLimiter, checkAccountLockout, async (req, res) => {
  try {
    const { tempToken, code, isBackupCode } = req.body;
    const result = await authService.verify2FALogin({
      tempToken,
      code,
      isBackupCode: Boolean(isBackupCode),
      reqInfo: getRequestInfo(req)
    });

    setAuthCookie(res, result.token);
    res.json({
      success: true,
      user: result.user,
      token: result.token,
      usedBackupCode: result.usedBackupCode,
      message: result.usedBackupCode
        ? 'Authenticated using backup code'
        : 'Two-factor authentication verified'
    });
  } catch (error) {
    sendError(res, error, 400);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const unusedCodes = await backupCodesRepo.getUnusedCodes(req.user.id);
    res.json({
      user: req.user,
      backupCodesRemaining: unusedCodes.length
    });
  } catch (error) {
    sendError(res, error, 500);
  }
});

router.get('/users', requireAuth, async (req, res) => {
  try {
    const users = await userRepo.getAllUsers();
    res.json({ users });
  } catch (error) {
    sendError(res, error, 500);
  }
});

router.post('/2fa/setup', requireAuth, async (req, res) => {
  try {
    const data = await authService.setup2FA(req.user.id);
    res.json(data);
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/2fa/confirm', requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    const result = await authService.confirm2FA(req.user.id, code, getRequestInfo(req));
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/2fa/disable', requireAuth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required to disable 2FA' });
    }
    const result = await authService.disable2FA(req.user.id, password, getRequestInfo(req));
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
