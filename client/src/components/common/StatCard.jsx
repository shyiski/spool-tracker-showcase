import React from 'react';
import { Paper, Group, Text, Title } from '@mantine/core';

export function StatCard({ title, value, icon: Icon, color, iconColor }) {
  return (
    <Paper p="md" radius="md" withBorder className="glass-card">
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed" fw={600} tt="uppercase">
            {title}
          </Text>
          <Title order={3} className="heading-font" mt={4} c={color}>
            {value}
          </Title>
        </div>
        {Icon && <Icon size={26} color={iconColor || '#6366f1'} />}
      </Group>
    </Paper>
  );
}
