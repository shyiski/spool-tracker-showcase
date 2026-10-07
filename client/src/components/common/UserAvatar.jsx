import React from 'react';
import { Avatar } from '@mantine/core';
import { getUserInitials } from '../../utils/formatters.js';

export function UserAvatar({
  user,
  size = 40,
  withIndicator = false,
  style = {},
  ...props
}) {
  const avatarSrc = user?.avatarUrl || user?.avatar_url;
  const isFemale = user?.gender === 'F';

  const gradient = isFemale
    ? { from: 'pink', to: 'violet' }
    : { from: 'indigo', to: 'blue' };

  const borderColor = avatarSrc ? '#4285F4' : 'rgba(99, 102, 241, 0.6)';

  const avatar = (
    <Avatar
      src={avatarSrc}
      size={size}
      radius="xl"
      color={isFemale ? 'pink' : 'indigo'}
      variant="gradient"
      gradient={gradient}
      style={{
        border: `2px solid ${borderColor}`,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        ...style
      }}
      {...props}
    >
      {getUserInitials(user)}
    </Avatar>
  );

  if (!withIndicator) {
    return avatar;
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {avatar}
      <span
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: avatarSrc ? '#4285F4' : '#10b981',
          border: '2px solid #0f172a'
        }}
        title={avatarSrc ? 'Google Account' : 'Online'}
      />
    </div>
  );
}
