import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { api } from '../../api.js';

export function useTwoFactorSetup({ onSuccess } = {}) {
  const [step, setStep] = useState(1);
  const [setupData, setSetupData] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setStep(1);
    setVerifyCode('');
    setBackupCodes([]);
    setError(null);
  }, []);

  const loadSetup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.setup2FA();
      setSetupData(data);
    } catch (err) {
      setError(err.message || 'Failed to initialize 2FA credentials');
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmCode = useCallback(async (e) => {
    if (e) e.preventDefault();
    const cleanCode = verifyCode.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      setError('Please enter the 6-digit verification code from your authenticator app');
      return;
    }

    setConfirmLoading(true);
    setError(null);

    try {
      const result = await api.confirm2FA(cleanCode);
      setBackupCodes(result.backupCodes || []);
      setStep(2);

      notifications.show({
        title: '2FA Activated!',
        message: 'Two-factor protection successfully enabled',
        color: 'teal'
      });

      onSuccess?.(result);
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please check your device clock.');
    } finally {
      setConfirmLoading(false);
    }
  }, [verifyCode, onSuccess]);

  const downloadBackupCodes = useCallback((accountEmail = '') => {
    const textContent = [
      'LoginPet — Two-Factor Authentication Backup Codes',
      accountEmail ? `Account: ${accountEmail}` : '',
      `Date: ${new Date().toLocaleString()}`,
      '',
      'Each code is single-use only:',
      ...backupCodes.map((code, idx) => `${idx + 1}. ${code}`),
      '',
      'Store these codes in a secure location!'
    ].filter(Boolean).join('\n');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `loginpet-backup-codes-${Date.now()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [backupCodes]);

  return {
    step,
    setStep,
    setupData,
    verifyCode,
    setVerifyCode,
    backupCodes,
    loading,
    confirmLoading,
    error,
    setError,
    reset,
    loadSetup,
    confirmCode,
    downloadBackupCodes
  };
}
