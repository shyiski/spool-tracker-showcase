import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Badge,
  Text,
  Group,
  Button,
  Stack,
  Loader,
  SimpleGrid
} from '@mantine/core';
import {
  IconRefresh,
  IconShieldLock,
  IconUsers,
  IconActivity
} from '@tabler/icons-react';
import { api } from '../../api.js';
import { formatTime } from '../../utils/formatters.js';
import { StatCard } from '../common/StatCard.jsx';

const ACTION_BADGES = {
  REGISTER: { color: 'indigo', label: 'REGISTER', variant: 'light' },
  LOGIN_SUCCESS: { color: 'green', label: 'LOGIN OK', variant: 'light' },
  LOGIN_FAILED: { color: 'red', label: 'LOGIN FAIL', variant: 'light' },
  '2FA_SUCCESS': { color: 'teal', label: '2FA OK', variant: 'light' },
  '2FA_FAILED': { color: 'orange', label: '2FA FAIL', variant: 'light' },
  BRUTE_FORCE_BLOCKED: { color: 'red', label: 'LOCKED 15M', variant: 'filled' },
  LOGIN_PASSWORD_OK: { color: 'blue', label: 'PASS OK', variant: 'light' },
  '2FA_ENABLED': { color: 'cyan', label: '2FA ON', variant: 'light' },
  '2FA_DISABLED': { color: 'gray', label: '2FA OFF', variant: 'light' }
};

function AuditActionBadge({ action }) {
  const config = ACTION_BADGES[action] || { color: 'gray', label: action, variant: 'light' };
  return (
    <Badge color={config.color} variant={config.variant}>
      {config.label}
    </Badge>
  );
}

export function AuditTable() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        api.getAuditLogs(20),
        api.getStats()
      ]);
      setLogs(logsRes.logs || []);
      setStats(statsRes.stats || null);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Stack gap="md" style={{ maxWidth: 860, width: '100%', margin: '0 auto' }}>
      {stats && (
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          <StatCard title="Users in DB" value={stats.totalUsers} icon={IconUsers} iconColor="#6366f1" />
          <StatCard title="2FA Protected" value={stats.usersWith2FA} icon={IconShieldLock} iconColor="#14b8a6" color="teal" />
          <StatCard title="Total Audit Events" value={stats.totalLogs} icon={IconActivity} iconColor="#38bdf8" />
        </SimpleGrid>
      )}

      <Card className="glass-card" radius="lg" p="lg" withBorder>
        <Group justify="space-between" mb="md">
          <div>
            <Text fw={700} size="md">Security & Audit Logs</Text>
            <Text size="xs" c="dimmed">Real-time registration, login, and 2FA authentication events</Text>
          </div>
          <Button
            variant="default"
            size="xs"
            leftSection={<IconRefresh size={14} />}
            onClick={fetchData}
            loading={loading}
          >
            Refresh
          </Button>
        </Group>

        {loading && logs.length === 0 ? (
          <Group justify="center" py="xl">
            <Loader size="sm" color="indigo" />
          </Group>
        ) : (
          <Table.ScrollContainer minWidth={600}>
            <Table verticalSpacing="xs" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Timestamp</Table.Th>
                  <Table.Th>Event</Table.Th>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Details</Table.Th>
                  <Table.Th>IP Address</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {logs.map((log) => (
                  <Table.Tr key={log.id || log._id}>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {formatTime(log.created_at)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <AuditActionBadge action={log.action} />
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" fw={500}>
                        {log.user_email || <span style={{ color: '#64748b' }}>Guest</span>}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">{log.details || '—'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" ff="monospace" c="dimmed">
                        {log.ip_address || '127.0.0.1'}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>
    </Stack>
  );
}
