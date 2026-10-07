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
  SimpleGrid,
  Title,
  TextInput,
  SegmentedControl
} from '@mantine/core';
import {
  IconRefresh,
  IconShieldCheck,
  IconUsers,
  IconSearch,
  IconGenderMale,
  IconGenderFemale,
  IconDatabase
} from '@tabler/icons-react';
import { api } from '../../api.js';
import { formatDate, isTwoFactorActive } from '../../utils/formatters.js';
import { UserAvatar, GenderBadge, TwoFactorBadge, StatCard } from '../common/index.js';

export function UsersTable({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAllUsers();
      setUsers(res.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const query = search.toLowerCase();
    const matchesSearch =
      (u.username || '').toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query);

    const matchesGender =
      genderFilter === 'ALL' ||
      (genderFilter === 'M' && u.gender === 'M') ||
      (genderFilter === 'F' && u.gender === 'F');

    return matchesSearch && matchesGender;
  });

  const totalM = users.filter((u) => u.gender === 'M').length;
  const totalF = users.filter((u) => u.gender === 'F').length;
  const total2FA = users.filter(isTwoFactorActive).length;

  return (
    <Stack gap="lg" style={{ maxWidth: 960, width: '100%', margin: '0 auto' }}>
      <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="sm">
        <StatCard title="Total Users" value={users.length} icon={IconUsers} iconColor="#6366f1" />
        <StatCard title="Male (M)" value={totalM} icon={IconGenderMale} iconColor="#60a5fa" color="blue" />
        <StatCard title="Female (F)" value={totalF} icon={IconGenderFemale} iconColor="#f472b6" color="pink" />
        <StatCard title="2FA Protected" value={total2FA} icon={IconShieldCheck} iconColor="#14b8a6" color="teal" />
      </SimpleGrid>

      <Card className="glass-card" radius="lg" p="lg" withBorder>
        <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
          <div>
            <Group gap="xs">
              <Title order={3} className="heading-font">
                System Users
              </Title>
              <Badge color="teal" variant="light" size="sm" leftSection={<IconDatabase size={12} />}>
                Database Synced
              </Badge>
            </Group>
            <Text size="xs" c="dimmed">
              List of registered users with nicknames, emails, and genders
            </Text>
          </div>

          <Button
            variant="default"
            size="xs"
            leftSection={<IconRefresh size={14} />}
            onClick={fetchUsers}
            loading={loading}
          >
            Refresh
          </Button>
        </Group>

        <Group justify="space-between" mb="md" wrap="wrap">
          <TextInput
            placeholder="Search by name or email..."
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="xs"
            radius="md"
            style={{ flex: 1, minWidth: 200 }}
          />

          <SegmentedControl
            size="xs"
            radius="md"
            value={genderFilter}
            onChange={setGenderFilter}
            data={[
              { label: 'All', value: 'ALL' },
              { label: 'Male (M)', value: 'M' },
              { label: 'Female (F)', value: 'F' }
            ]}
          />
        </Group>

        {loading && users.length === 0 ? (
          <Group justify="center" py="xl">
            <Loader size="md" color="indigo" />
          </Group>
        ) : filteredUsers.length === 0 ? (
          <Stack align="center" py="xl">
            <Text size="sm" c="dimmed">
              No users found
            </Text>
          </Stack>
        ) : (
          <Table.ScrollContainer minWidth={640}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Username</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Gender</Table.Th>
                  <Table.Th>2FA Security</Table.Th>
                  <Table.Th>Registration Date</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredUsers.map((u) => {
                  const isCurrent = currentUser?.id === u.id || currentUser?._id === u._id;
                  const has2FA = isTwoFactorActive(u);

                  return (
                    <Table.Tr key={u.id || u._id} style={isCurrent ? { background: 'rgba(99, 102, 241, 0.08)' } : undefined}>
                      <Table.Td>
                        <Group gap="sm">
                          <UserAvatar user={u} size={36} />
                          <div>
                            <Group gap={6} align="center">
                              <Text size="sm" fw={600}>
                                {u.username}
                              </Text>
                              {isCurrent && (
                                <Badge size="xs" color="indigo" variant="filled">
                                  You
                                </Badge>
                              )}
                            </Group>
                            <Text size="11px" c="dimmed" ff="monospace">
                              ID: {String(u.id || u._id).slice(-6)}
                            </Text>
                          </div>
                        </Group>
                      </Table.Td>

                      <Table.Td>
                        <Text size="sm">{u.email}</Text>
                      </Table.Td>

                      <Table.Td>
                        <GenderBadge gender={u.gender} />
                      </Table.Td>

                      <Table.Td>
                        <TwoFactorBadge enabled={has2FA} format="status" />
                      </Table.Td>

                      <Table.Td>
                        <Text size="xs" c="dimmed">
                          {formatDate(u.created_at)}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>
    </Stack>
  );
}
