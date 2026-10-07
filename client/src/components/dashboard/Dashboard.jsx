import React, { useState } from 'react';
import {
  Card,
  Title,
  Text,
  Button,
  Stack,
  Group,
  ThemeIcon,
  SimpleGrid,
  Paper,
  Modal,
  PasswordInput,
  Alert
} from '@mantine/core';
import {
  IconShieldCheck,
  IconShieldOff,
  IconDatabase,
  IconLock,
  IconAlertCircle,
  IconEdit
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { api } from '../../api.js';
import { isTwoFactorActive } from '../../utils/formatters.js';
import { UserAvatar, GenderBadge, TwoFactorBadge } from '../common/index.js';
import { TwoFactorSetupModal } from '../two-factor/TwoFactorSetupModal.jsx';
import { ProfileSetup } from '../profile/ProfileSetup.jsx';

export function Dashboard({ user, onUserUpdate, onLogout }) {
  const [setupModalOpened, setSetupModalOpened] = useState(false);
  const [disableModalOpened, setDisableModalOpened] = useState(false);
  const [profileModalOpened, setProfileModalOpened] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState(null);

  const is2FA = isTwoFactorActive(user);

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    if (!disablePassword) {
      setDisableError('Please enter your current password');
      return;
    }

    setDisableLoading(true);
    setDisableError(null);
    try {
      await api.disable2FA(disablePassword);
      notifications.show({
        title: '2FA Disabled',
        message: 'Two-factor authentication has been turned off',
        color: 'yellow'
      });
      setDisableModalOpened(false);
      setDisablePassword('');
      onUserUpdate();
    } catch (err) {
      setDisableError(err.message || 'Invalid password');
    } finally {
      setDisableLoading(false);
    }
  };

  return (
    <Stack gap="lg" style={{ maxWidth: 860, width: '100%', margin: '0 auto' }}>
      <Card className="glass-card" radius="lg" p="xl" withBorder>
        <Group justify="space-between" align="center" wrap="wrap">
          <Group gap="md">
            <UserAvatar user={user} size={64} />
            <div>
              <Group gap="xs" align="center">
                <Title order={2} className="heading-font">
                  {user?.username}
                </Title>
                <GenderBadge gender={user?.gender} />
              </Group>

              <Text size="sm" c="dimmed">
                {user?.email}
              </Text>
              <Text size="xs" c="dimmed" mt={2} ff="monospace">
                ID: {user?.id || user?._id}
              </Text>
            </div>
          </Group>

          <Group gap="sm">
            <TwoFactorBadge enabled={is2FA} size="lg" format="long" />

            <Button
              variant="subtle"
              color="indigo"
              size="sm"
              radius="md"
              leftSection={<IconEdit size={14} />}
              onClick={() => setProfileModalOpened(true)}
            >
              Profile
            </Button>

            <Button variant="default" color="red" radius="md" onClick={onLogout}>
              Logout
            </Button>
          </Group>
        </Group>
      </Card>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Card className="glass-card" radius="lg" p="lg" withBorder>
          <Stack justify="space-between" h="100%">
            <div>
              <Group gap="xs" mb="xs">
                <ThemeIcon size={36} radius="md" color={is2FA ? 'teal' : 'yellow'} variant="light">
                  {is2FA ? <IconShieldCheck size={20} /> : <IconShieldOff size={20} />}
                </ThemeIcon>
                <div>
                  <Text fw={700} size="md">
                    Two-Factor Protection (TOTP)
                  </Text>
                  <Text size="xs" c="dimmed">
                    Google Authenticator / Authy
                  </Text>
                </div>
              </Group>

              <Text size="sm" c="dimmed" mt="sm">
                {is2FA
                  ? 'Every login requires a one-time 6-digit code from your smartphone or a backup recovery code.'
                  : 'Protect your account from unauthorized access. Even if someone learns your password, they cannot sign in without your device.'}
              </Text>
            </div>

            <Group mt="md">
              {!is2FA ? (
                <Button
                  fullWidth
                  color="teal"
                  radius="md"
                  leftSection={<IconShieldCheck size={18} />}
                  onClick={() => setSetupModalOpened(true)}
                >
                  Configure Authenticator
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant="light"
                  color="red"
                  radius="md"
                  leftSection={<IconShieldOff size={18} />}
                  onClick={() => {
                    setDisableError(null);
                    setDisablePassword('');
                    setDisableModalOpened(true);
                  }}
                >
                  Disable 2FA
                </Button>
              )}
            </Group>
          </Stack>
        </Card>

        <Card className="glass-card" radius="lg" p="lg" withBorder>
          <Stack justify="space-between" h="100%">
            <div>
              <Group gap="xs" mb="xs">
                <ThemeIcon size={36} radius="md" color="green" variant="light">
                  <IconDatabase size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={700} size="md">
                    Account Security & Storage
                  </Text>
                  <Text size="xs" c="dimmed">
                    Protected database records
                  </Text>
                </div>
              </Group>

              <Stack gap="xs" mt="sm">
                <Paper p="xs" radius="md" withBorder style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Name in DB:</Text>
                    <Text size="xs" fw={600} ff="monospace">{user?.username || '—'}</Text>
                  </Group>
                </Paper>

                <Paper p="xs" radius="md" withBorder style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Gender in DB:</Text>
                    <Text size="xs" fw={600} ff="monospace">
                      {user?.gender ? (user.gender === 'M' ? 'Male (M)' : 'Female (F)') : 'Not specified'}
                    </Text>
                  </Group>
                </Paper>

                <Paper p="xs" radius="md" withBorder style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Security Status:</Text>
                    <Text size="xs" fw={600} ff="monospace" c={is2FA ? 'teal' : 'yellow'}>
                      {is2FA ? 'Protected (2FA)' : 'Standard Password'}
                    </Text>
                  </Group>
                </Paper>
              </Stack>
            </div>

            <div className="db-status-pill" style={{ justifyContent: 'center' }}>
              <span className="pulse-dot"></span>
              <span>Active Database Session</span>
            </div>
          </Stack>
        </Card>
      </SimpleGrid>

      <TwoFactorSetupModal
        opened={setupModalOpened}
        onClose={() => setSetupModalOpened(false)}
        onSetupSuccess={onUserUpdate}
        accountEmail={user?.email}
      />

      <Modal
        opened={profileModalOpened}
        onClose={() => setProfileModalOpened(false)}
        title="Edit Profile"
        centered
        size="md"
      >
        <ProfileSetup
          user={user}
          onComplete={(_updatedUser) => {
            setProfileModalOpened(false);
            onUserUpdate();
          }}
        />
      </Modal>

      <Modal
        opened={disableModalOpened}
        onClose={() => setDisableModalOpened(false)}
        title="Disable Two-Factor Authentication"
        centered
        size="sm"
      >
        <form onSubmit={handleDisable2FA}>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              To confirm disabling 2FA, please enter your account password:
            </Text>

            {disableError && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" radius="md">
                {disableError}
              </Alert>
            )}

            <PasswordInput
              label="Current Password"
              placeholder="Your password"
              leftSection={<IconLock size={16} />}
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              required
              autoFocus
              disabled={disableLoading}
            />

            <Group justify="flex-end" mt="xs">
              <Button variant="default" onClick={() => setDisableModalOpened(false)}>
                Cancel
              </Button>
              <Button type="submit" color="red" loading={disableLoading}>
                Disable
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
