import React, { useState } from 'react';
import { Stack, TextInput, PasswordInput, Button } from '@mantine/core';
import { IconMail, IconLock, IconLogin } from '@tabler/icons-react';

export function LoginForm({ onSubmit, loading }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ identifier: identifier.trim(), password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Email or Username"
          placeholder="user@example.com"
          leftSection={<IconMail size={16} />}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={loading}
          required
          radius="md"
        />

        <PasswordInput
          label="Password"
          placeholder="Your password"
          leftSection={<IconLock size={16} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          radius="md"
        />

        <Button
          type="submit"
          fullWidth
          size="md"
          color="indigo"
          radius="md"
          loading={loading}
          leftSection={<IconLogin size={18} />}
          mt="xs"
        >
          Sign In
        </Button>
      </Stack>
    </form>
  );
}
