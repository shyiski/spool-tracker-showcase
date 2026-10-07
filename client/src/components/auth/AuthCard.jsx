import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Button,
  Title,
  Text,
  Stack,
  Alert,
  Group,
  ThemeIcon,
  Divider
} from '@mantine/core';
import {
  IconLock,
  IconAlertCircle,
  IconUserPlus,
  IconLogin,
  IconShield
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { api } from '../../api.js';
import { GoogleIcon } from '../common/GoogleIcon.jsx';
import { LoginForm } from './LoginForm.jsx';
import { RegisterForm } from './RegisterForm.jsx';
import { TwoFactorVerifyModal } from '../two-factor/TwoFactorVerifyModal.jsx';

const DEFAULT_GOOGLE_CLIENT_ID = '1058902973952-s6qj47kl0qvnacu5p7vaogtot3e2i4e1.apps.googleusercontent.com';

export function AuthCard({ onAuthSuccess, onRegisterSuccess }) {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [twoFactorData, setTwoFactorData] = useState(null);

  const performGoogleLogin = async ({ email, name, googleId, avatarUrl }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.loginGoogle({
        email: email.trim(),
        name: name || email.trim().split('@')[0],
        googleId: googleId || `google_${Date.now()}`,
        avatarUrl: avatarUrl || null
      });

      if (res.isNew) {
        notifications.show({
          title: 'Google Registration Successful!',
          message: `Signed in as ${email}. Setting up 2FA...`,
          color: 'teal'
        });
        onRegisterSuccess(res.user);
      } else {
        notifications.show({
          title: 'Google Sign In',
          message: `Welcome back, ${res.user.username || name || email}!`,
          color: 'teal'
        });
        onAuthSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Failed to complete Google authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async ({ identifier, password }) => {
    if (!identifier || !password) {
      setError('Please fill in email (or username) and password');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ identifier, password });

      if (res.requires2FA) {
        setTwoFactorData(res);
        return;
      }

      notifications.show({
        title: 'Login Successful',
        message: `Welcome back, ${res.user.username || res.user.email}!`,
        color: 'teal'
      });
      onAuthSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.register({ email, password });

      notifications.show({
        title: 'Account Created!',
        message: 'User saved in database. Proceeding to 2FA setup...',
        color: 'teal'
      });

      onRegisterSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setError(null);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

    const launchPopup = () => {
      setLoading(true);
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          prompt: 'select_account',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setLoading(false);
              if (tokenResponse.error !== 'popup_closed_by_user') {
                setError(`Google Sign-In: ${tokenResponse.error_description || tokenResponse.error}`);
              }
              return;
            }

            try {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });

              if (!userInfoRes.ok) throw new Error('Failed to fetch Google profile');

              const profile = await userInfoRes.json();
              await performGoogleLogin({
                email: profile.email,
                name: profile.name || profile.email.split('@')[0],
                googleId: profile.sub,
                avatarUrl: profile.picture || null
              });
            } catch (err) {
              setError(err.message || 'Failed to complete Google authentication');
              setLoading(false);
            }
          }
        });

        client.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        setLoading(false);
        setError(err.message || 'Could not launch Google Sign-In popup');
      }
    };

    if (window.google?.accounts?.oauth2) {
      launchPopup();
    } else {
      setLoading(true);
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => {
        if (window.google?.accounts?.oauth2) {
          launchPopup();
        } else {
          setLoading(false);
          setError('Google Identity Services failed to load.');
        }
      };
      script.onerror = () => {
        setLoading(false);
        setError('Failed to load Google Sign-In script.');
      };
      document.head.appendChild(script);
    }
  };

  if (twoFactorData) {
    return (
      <TwoFactorVerifyModal
        tempAuthData={twoFactorData}
        onSuccess={(user) => {
          setTwoFactorData(null);
          onAuthSuccess(user);
        }}
        onCancel={() => {
          setTwoFactorData(null);
          setError(null);
        }}
      />
    );
  }

  const isLockout = error?.toLowerCase().includes('lock');

  return (
    <Card
      className="glass-card fade-in"
      radius="lg"
      p="xl"
      withBorder
      style={{ maxWidth: 460, width: '100%', margin: '0 auto' }}
    >
      <Stack gap="md">
        <Group justify="flex-start" align="center">
          <Group gap="xs">
            <ThemeIcon
              size={40}
              radius="md"
              color="indigo"
              variant="gradient"
              gradient={{ from: 'indigo', to: 'violet', deg: 45 }}
            >
              <IconShield size={22} />
            </ThemeIcon>
            <div>
              <Title order={3} className="heading-font" style={{ letterSpacing: '-0.5px' }}>
                LoginPet
              </Title>
              <Text size="xs" c="dimmed">
                Two-Factor Authentication (2FA)
              </Text>
            </div>
          </Group>
        </Group>

        {error && (
          <Alert
            icon={isLockout ? <IconLock size={16} /> : <IconAlertCircle size={16} />}
            title={isLockout ? 'Security Lockout (15 min)' : 'Authentication Error'}
            color="red"
            variant="light"
            radius="md"
          >
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="default"
          size="md"
          radius="md"
          loading={loading}
          leftSection={<GoogleIcon />}
          onClick={handleGoogleAuth}
        >
          Continue with Google
        </Button>

        <Divider label="or continue with email and password" labelPosition="center" my="xs" />

        <Tabs
          value={activeTab}
          onChange={(val) => {
            setActiveTab(val);
            setError(null);
          }}
          variant="pills"
          radius="md"
          color="indigo"
        >
          <Tabs.List grow mb="md">
            <Tabs.Tab value="login" leftSection={<IconLogin size={16} />}>
              Sign In
            </Tabs.Tab>
            <Tabs.Tab value="register" leftSection={<IconUserPlus size={16} />}>
              Sign Up
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="login">
            <LoginForm onSubmit={handleLogin} loading={loading} />
          </Tabs.Panel>

          <Tabs.Panel value="register">
            <RegisterForm onSubmit={handleRegister} loading={loading} onError={setError} />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Card>
  );
}
