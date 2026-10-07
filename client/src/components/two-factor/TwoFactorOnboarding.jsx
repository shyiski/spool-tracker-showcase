import React, { useEffect } from 'react';
import {
  Card,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Alert,
  ThemeIcon,
  Loader,
  Badge
} from '@mantine/core';
import {
  IconShieldLock,
  IconAlertCircle,
  IconArrowRight,
  IconPlayerSkipForward
} from '@tabler/icons-react';
import { useTwoFactorSetup } from './useTwoFactorSetup.js';
import { TwoFactorQrStep } from './TwoFactorQrStep.jsx';
import { BackupCodesStep } from './BackupCodesStep.jsx';

export function TwoFactorOnboarding({ user, onComplete, onSkip, onCancel }) {
  const {
    step,
    setupData,
    verifyCode,
    setVerifyCode,
    backupCodes,
    loading,
    confirmLoading,
    error,
    loadSetup,
    confirmCode,
    downloadBackupCodes
  } = useTwoFactorSetup();

  useEffect(() => {
    loadSetup();
  }, [loadSetup]);

  return (
    <Card className="glass-card fade-in" radius="lg" p="xl" withBorder style={{ maxWidth: 520, width: '100%', margin: '0 auto' }}>
      <Stack gap="md">
        <Group justify="center">
          <ThemeIcon size={56} radius="xl" color="teal" variant="light">
            <IconShieldLock size={32} />
          </ThemeIcon>
        </Group>

        <div style={{ textAlign: 'center' }}>
          <Badge color="teal" variant="light" size="sm" mb="xs">
            Step 1 of 2: Account Security
          </Badge>
          <Title order={3} className="heading-font">
            {step === 1 ? 'Connect Authenticator' : 'Save Backup Codes'}
          </Title>
          <Text size="sm" c="dimmed" mt={4}>
            {step === 1
              ? 'Protect your account with two-factor verification via Google Authenticator'
              : 'Backup codes allow you to sign in if you lose access to your device'}
          </Text>
        </div>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Notice" color="red" variant="light" radius="md">
            {error}
          </Alert>
        )}

        {loading ? (
          <Stack align="center" py="xl">
            <Loader size="md" color="teal" />
            <Text size="sm" c="dimmed">Generating security QR code...</Text>
          </Stack>
        ) : step === 1 ? (
          <Stack gap="md">
            <TwoFactorQrStep
              setupData={setupData}
              verifyCode={verifyCode}
              onCodeChange={setVerifyCode}
              onSubmit={confirmCode}
              confirmLoading={confirmLoading}
              submitLabel="Verify and Enable 2FA"
            />

            <Group justify="center" mt="xs" gap="sm" wrap="wrap">
              <Button
                variant="subtle"
                color="gray"
                size="xs"
                rightSection={<IconPlayerSkipForward size={14} />}
                onClick={onSkip}
              >
                Skip and configure later
              </Button>

              {onCancel && (
                <Button
                  variant="subtle"
                  color="gray"
                  size="xs"
                  onClick={onCancel}
                >
                  ← Back to Users Table
                </Button>
              )}
            </Group>
          </Stack>
        ) : (
          <BackupCodesStep
            backupCodes={backupCodes}
            onDownload={() => downloadBackupCodes(user?.email)}
            actionButton={
              <Button
                color="indigo"
                fullWidth
                size="md"
                radius="md"
                mt="md"
                rightSection={<IconArrowRight size={18} />}
                onClick={onComplete}
              >
                Proceed to Profile Setup (Name & Gender)
              </Button>
            }
          />
        )}
      </Stack>
    </Card>
  );
}
