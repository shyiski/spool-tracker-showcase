import { useState, useEffect, useCallback } from 'react';
import { api } from '../api.js';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState(null);
  const [currentView, setCurrentView] = useState('auth');

  const checkAuth = useCallback(async () => {
    try {
      const res = await api.getMe();
      if (res.user) {
        setCurrentUser(res.user);
        if (!res.user.profile_completed && !res.user.gender) {
          setCurrentView('profile-setup');
        } else {
          setCurrentView('users-table');
        }
      }
    } catch {
      setCurrentUser(null);
      setCurrentView('auth');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    try {
      const health = await api.getHealth();
      setDbStatus(health);
    } catch (e) {
      console.error('Health check failed:', e);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    checkAuth();
  }, [fetchHealth, checkAuth]);

  const handleAuthSuccess = useCallback((user) => {
    setCurrentUser(user);
    if (!user.profile_completed && !user.gender) {
      setCurrentView('profile-setup');
    } else {
      setCurrentView('users-table');
    }
    fetchHealth();
  }, [fetchHealth]);

  const handleRegisterSuccess = useCallback((user) => {
    setCurrentUser(user);
    setCurrentView('setup-2fa');
    fetchHealth();
  }, [fetchHealth]);

  const handle2FAOnboardingComplete = useCallback(() => {
    setCurrentView('profile-setup');
    checkAuth();
  }, [checkAuth]);

  const handleProfileComplete = useCallback((updatedUser) => {
    setCurrentUser(updatedUser);
    setCurrentView('users-table');
    fetchHealth();
  }, [fetchHealth]);

  const handleLogout = useCallback(async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setCurrentUser(null);
    setCurrentView('auth');
  }, []);

  return {
    currentUser,
    setCurrentUser,
    authLoading,
    dbStatus,
    currentView,
    setCurrentView,
    checkAuth,
    fetchHealth,
    handleAuthSuccess,
    handleRegisterSuccess,
    handle2FAOnboardingComplete,
    handleProfileComplete,
    handleLogout
  };
}
