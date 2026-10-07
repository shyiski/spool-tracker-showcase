import React, { useState } from 'react';
import { Stack, TextInput, PasswordInput, Button, Badge } from '@mantine/core';
import { IconMail, IconLock, IconUserPlus, IconDatabase } from '@tabler/icons-react';
import { PasswordRequirements, checkPasswordStrength } from './PasswordRequirements.jsx';

export function RegisterForm({ onSubmit, loading, onError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      onError?.('Email and password are required');
      return;
    }

    const { hasMinLength, hasUppercase, hasSpecialChar } = checkPasswordStrength(password);
    if (!hasMinLength) {
      onError?.('Password must be at least 6 characters long');
      return;
    }
    if (!hasUppercase) {
      onError?.('Password must contain at least one uppercase letter (A-Z)');
      return;
    }
    if (!hasSpecialChar) {
      onError?.('Password must contain at least one special character or symbol (!@#$...)');
      return;
    }

    onSubmit({ email: cleanEmail, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Email Address"
          placeholder="user@example.com"
          type="email"
          leftSection={<IconMail size={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          radius="md"
        />

        <PasswordInput
          label="Password"
          placeholder="Min 6 chars, uppercase & special symbol"
          leftSection={<IconLock size={16} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          radius="md"
        />

        <PasswordRequirements password={password} />

        <Badge
          color="teal"
          variant="light"
          size="sm"
          radius="sm"
          leftSection={<IconDatabase size={12} />}
        >
          Saved in MongoDB Atlas (bcrypt hashing)
        </Badge>

        <Button
          type="submit"
          fullWidth
          size="md"
          color="teal"
          radius="md"
          loading={loading}
          leftSection={<IconUserPlus size={18} />}
        >
          Create Account & Setup 2FA
        </Button>
      </Stack>
    </form>
  );
}
