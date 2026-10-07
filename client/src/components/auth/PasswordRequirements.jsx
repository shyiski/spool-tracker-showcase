import React from 'react';
import { Paper, Stack, Text, Group, Badge } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

export function checkPasswordStrength(password = '') {
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`§±]/.test(password);
  const isValid = hasMinLength && hasUppercase && hasSpecialChar;

  return { hasMinLength, hasUppercase, hasSpecialChar, isValid };
}

export function PasswordRequirements({ password = '' }) {
  if (!password) return null;

  const { hasMinLength, hasUppercase, hasSpecialChar } = checkPasswordStrength(password);

  return (
    <Paper
      p="xs"
      radius="md"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <Stack gap={4}>
        <Text size="xs" fw={600} c="dimmed">
          Password requirements:
        </Text>
        <Group gap="xs">
          <Badge
            size="xs"
            variant={hasMinLength ? 'filled' : 'outline'}
            color={hasMinLength ? 'teal' : 'gray'}
            leftSection={hasMinLength ? <IconCheck size={10} stroke={3} /> : null}
          >
            6+ characters
          </Badge>
          <Badge
            size="xs"
            variant={hasUppercase ? 'filled' : 'outline'}
            color={hasUppercase ? 'teal' : 'gray'}
            leftSection={hasUppercase ? <IconCheck size={10} stroke={3} /> : null}
          >
            1 uppercase (A-Z)
          </Badge>
          <Badge
            size="xs"
            variant={hasSpecialChar ? 'filled' : 'outline'}
            color={hasSpecialChar ? 'teal' : 'gray'}
            leftSection={hasSpecialChar ? <IconCheck size={10} stroke={3} /> : null}
          >
            1 symbol (!@#$...)
          </Badge>
        </Group>
      </Stack>
    </Paper>
  );
}
