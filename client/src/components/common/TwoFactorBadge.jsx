import React from 'react';
import { Badge } from '@mantine/core';
import { IconShieldCheck, IconShieldOff } from '@tabler/icons-react';

export function TwoFactorBadge({
  enabled,
  size = 'sm',
  variant = 'light',
  format = 'short',
  showIcon = true
}) {
  const isEnabled = Boolean(enabled === 1 || enabled === true);
  const iconSize = size === 'xs' ? 12 : size === 'lg' ? 16 : 14;

  const label = isEnabled
    ? (format === 'long' ? '2FA Protection Active' : format === 'status' ? 'Enabled' : '2FA On')
    : (format === 'long' ? '2FA Disabled' : format === 'status' ? 'Disabled' : '2FA Off');

  const icon = showIcon ? (
    isEnabled ? <IconShieldCheck size={iconSize} /> : <IconShieldOff size={iconSize} />
  ) : null;

  return (
    <Badge
      size={size}
      variant={variant}
      color={isEnabled ? 'teal' : format === 'long' ? 'yellow' : 'gray'}
      leftSection={icon}
    >
      {label}
    </Badge>
  );
}
