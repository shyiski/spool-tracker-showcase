import React from 'react';
import { Badge } from '@mantine/core';
import { IconGenderMale, IconGenderFemale } from '@tabler/icons-react';

export function GenderBadge({ gender, size = 'sm', variant = 'light' }) {
  const iconSize = size === 'xs' ? 12 : 14;

  if (gender === 'M') {
    return (
      <Badge
        color="blue"
        variant={variant}
        size={size}
        leftSection={<IconGenderMale size={iconSize} />}
      >
        Male (M)
      </Badge>
    );
  }

  if (gender === 'F') {
    return (
      <Badge
        color="pink"
        variant={variant}
        size={size}
        leftSection={<IconGenderFemale size={iconSize} />}
      >
        Female (F)
      </Badge>
    );
  }

  return (
    <Badge color="gray" variant={variant} size={size}>
      Not specified
    </Badge>
  );
}
