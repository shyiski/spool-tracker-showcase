import React from 'react';
import {
  Stack,
  Text,
  PinInput,
  Button,
  Group,
  Paper,
  Image,
  CopyButton,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { IconShieldCheck, IconCopy, IconCheck } from '@tabler/icons-react';

export function TwoFactorQrStep({
  setupData,
  verifyCode,
  onCodeChange,
  onSubmit,
  confirmLoading,
  submitLabel = 'Activate 2FA'
}) {
  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        1. Open <strong>Google Authenticator</strong>, <strong>Apple Passwords</strong>, or <strong>Authy</strong> on your smartphone.
      </Text>
      <Text size="sm" c="dimmed">
        2. Scan this QR code with your authenticator app:
      </Text>

      {setupData?.qrCodeDataUrl && (
        <Group justify="center">
          <Paper p="xs" radius="md" style={{ background: '#ffffff', display: 'inline-block' }}>
            <Image
              src={setupData.qrCodeDataUrl}
              alt="2FA QR Code"
              w={170}
              h={170}
              fit="contain"
            />
          </Paper>
        </Group>
      )}

      <Paper p="xs" radius="md" withBorder style={{ background: 'rgba(30, 41, 59, 0.4)' }}>
        <Group justify="space-between">
          <div>
            <Text size="xs" c="dimmed">Secret key (for manual entry):</Text>
            <Text size="sm" ff="monospace" fw={600} style={{ letterSpacing: '1px' }}>
              {setupData?.secret}
            </Text>
          </div>
          <CopyButton value={setupData?.secret || ''} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Copied!' : 'Copy Key'}>
                <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                  {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Group>
      </Paper>

      <Text size="sm" c="dimmed" mt="xs">
        3. Enter the 6-digit code to confirm:
      </Text>

      <form onSubmit={onSubmit}>
        <Stack gap="md" align="center">
          <PinInput
            size="lg"
            length={6}
            type="number"
            placeholder="○"
            value={verifyCode}
            onChange={onCodeChange}
            disabled={confirmLoading}
            autoFocus
          />

          <Button
            type="submit"
            fullWidth
            size="md"
            color="teal"
            radius="md"
            loading={confirmLoading}
            leftSection={<IconShieldCheck size={18} />}
          >
            {submitLabel}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
