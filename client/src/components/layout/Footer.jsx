import React from 'react';
import { Container, Text } from '@mantine/core';

export function Footer({ dbStatus }) {
  return (
    <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', padding: '16px 0', textAlign: 'center' }}>
      <Container size="lg">
        <Text size="xs" c="dimmed">
          LoginPet Auth System • React 19 + Mantine UI 7 • {dbStatus?.database || 'Database'} ({dbStatus?.engine || 'Node.js'})
        </Text>
      </Container>
    </footer>
  );
}
