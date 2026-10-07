import React from 'react';
import {
  Container,
  Group,
  Title,
  Text,
  ThemeIcon,
  Menu,
  UnstyledButton
} from '@mantine/core';
import {
  IconShield,
  IconActivity,
  IconLogout,
  IconSettings,
  IconUsers,
  IconShieldLock,
  IconChevronDown
} from '@tabler/icons-react';
import { isTwoFactorActive } from '../../utils/formatters.js';
import { UserAvatar, GenderBadge, TwoFactorBadge } from '../common/index.js';

export function Navbar({
  currentUser,
  dbStatus,
  currentView,
  onNavigate,
  onLogout
}) {
  const is2FA = isTwoFactorActive(currentUser);

  return (
    <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <Container size="lg" py="sm">
        <Group justify="space-between">
          <Group
            gap="sm"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate(currentUser ? 'users-table' : 'auth')}
          >
            <ThemeIcon
              size={38}
              radius="md"
              color="indigo"
              variant="gradient"
              gradient={{ from: 'indigo', to: 'violet', deg: 45 }}
            >
              <IconShield size={22} />
            </ThemeIcon>
            <div>
              <Title order={4} className="heading-font" style={{ letterSpacing: '-0.3px', margin: 0 }}>
                LoginPet
              </Title>
              <Text size="11px" c="dimmed" style={{ margin: 0, lineHeight: 1 }}>
                2FA & Security System
              </Text>
            </div>
          </Group>

          <Group gap="md">
            <div className="db-status-pill">
              <span className="pulse-dot"></span>
              <span>{dbStatus?.database || 'Database Online'}</span>
            </div>

            {currentUser && (
              <Menu shadow="lg" width={270} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }}>
                <Menu.Target>
                  <UnstyledButton style={{ outline: 'none', cursor: 'pointer' }}>
                    <Group gap={8} align="center">
                      <UserAvatar user={currentUser} size={42} withIndicator />
                      <div style={{ textAlign: 'left' }} className="user-nav-meta">
                        <Text size="xs" fw={700} style={{ lineHeight: 1.2 }}>
                          {currentUser.username}
                        </Text>
                        <Text size="10px" c="dimmed" style={{ lineHeight: 1.2 }}>
                          {currentUser.avatarUrl || currentUser.avatar_url
                            ? 'Google'
                            : (currentUser.gender === 'M' ? 'Male (M)' : currentUser.gender === 'F' ? 'Female (F)' : 'Profile')}
                        </Text>
                      </div>
                      <IconChevronDown size={14} color="#94a3b8" />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown className="glass-card">
                  <div style={{ padding: '10px 12px' }}>
                    <Group gap="xs" mb={6}>
                      <UserAvatar user={currentUser} size={36} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text size="sm" fw={700} truncate>
                          {currentUser.username}
                        </Text>
                        <Text size="xs" c="dimmed" truncate>
                          {currentUser.email}
                        </Text>
                      </div>
                    </Group>

                    <Group gap={4} mt={6}>
                      <GenderBadge gender={currentUser.gender} size="xs" />
                      <TwoFactorBadge enabled={is2FA} size="xs" />
                    </Group>
                  </div>

                  <Menu.Divider />

                  <Menu.Label>Navigation</Menu.Label>
                  <Menu.Item
                    leftSection={<IconUsers size={16} />}
                    onClick={() => onNavigate('users-table')}
                    style={{
                      backgroundColor: currentView === 'users-table' ? 'rgba(99, 102, 241, 0.15)' : undefined,
                      fontWeight: currentView === 'users-table' ? 600 : 400
                    }}
                  >
                    Users Table
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<IconShieldLock size={16} />}
                    onClick={() => onNavigate('dashboard')}
                    style={{
                      backgroundColor: currentView === 'dashboard' ? 'rgba(99, 102, 241, 0.15)' : undefined,
                      fontWeight: currentView === 'dashboard' ? 600 : 400
                    }}
                  >
                    2FA & Security
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<IconActivity size={16} />}
                    onClick={() => onNavigate('logs')}
                    style={{
                      backgroundColor: currentView === 'logs' ? 'rgba(99, 102, 241, 0.15)' : undefined,
                      fontWeight: currentView === 'logs' ? 600 : 400
                    }}
                  >
                    Audit Logs
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Label>Account</Menu.Label>
                  <Menu.Item
                    leftSection={<IconSettings size={16} />}
                    onClick={() => onNavigate('profile-setup')}
                    style={{
                      backgroundColor: currentView === 'profile-setup' ? 'rgba(99, 102, 241, 0.15)' : undefined,
                      fontWeight: currentView === 'profile-setup' ? 600 : 400
                    }}
                  >
                    Profile Settings
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    color="red"
                    leftSection={<IconLogout size={16} />}
                    onClick={onLogout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Group>
      </Container>
    </header>
  );
}
