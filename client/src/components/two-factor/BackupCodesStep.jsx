import React from 'react';
import { Stack, Alert, Text, SimpleGrid, Group, CopyButton, Button } from '@mantine/core';
import { IconShieldCheck, IconCopy, IconCheck, IconDownload } from '@tabler/icons-react';

export function BackupCodesStep({
  backupCodes,
  onDownload,
  actionButton
}) {
  return (
    <Stack gap="md">
      <Alert color="teal" variant="light" radius="md" icon={<IconShieldCheck size={18} />}>
        Two-factor authentication successfully configured!
      </Alert>

      <Text size="sm">
        If you lose access to your Authenticator app, you can sign in using these backup codes.
        <strong> Save them right now!</strong> Each code can only be used once.
      </Text>

      <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
        {backupCodes.map((code, idx) => (
          <div key={idx} className="backup-code-chip">
            {code}
          </div>
        ))}
      </SimpleGrid>

      <Group justify="space-between" mt="md" wrap="wrap" gap="xs">
        <Group gap="xs">
          <CopyButton value={backupCodes.join('\n')} timeout={2000}>
            {({ copied, copy }) => (
              <Button
                variant="default"
                size="sm"
                leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                onClick={copy}
              >
                {copied ? 'Copied!' : 'Copy All'}
              </Button>
            )}
          </CopyButton>

          <Button
            variant="default"
            size="sm"
            leftSection={<IconDownload size={16} />}
            onClick={onDownload}
          >
            Download .txt
          </Button>
        </Group>

        {actionButton}
      </Group>
    </Stack>
  );
}
