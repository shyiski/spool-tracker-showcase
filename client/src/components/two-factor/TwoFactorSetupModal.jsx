import React, { useEffect } from 'react';
import { Modal, Text, Group, Alert, ThemeIcon, Stack, Loader, Button } from '@mantine/core';
import { IconShieldCheck, IconAlertCircle } from '@tabler/icons-react';
import { useTwoFactorSetup } from './useTwoFactorSetup.js';
import { TwoFactorQrStep } from './TwoFactorQrStep.jsx';
import { BackupCodesStep } from './BackupCodesStep.jsx';

export function TwoFactorSetupModal({ opened, onClose, onSetupSuccess, accountEmail }) {
  const {
    step,
    setupData,
    verifyCode,
    setVerifyCode,
    backupCodes,
    loading,
    confirmLoading,
    error,
    reset,
    loadSetup,
    confirmCode,
    downloadBackupCodes
  } = useTwoFactorSetup({ onSuccess: onSetupSuccess });

  useEffect(() => {
    if (opened) {
      reset();
      loadSetup();
    }
  }, [opened, reset, loadSetup]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon size={28} color="teal" variant="light" radius="md">
            <IconShieldCheck size={18} />
          </ThemeIcon>
          <Text fw={700} className="heading-font">
            {step === 1 ? 'Connect Authenticator' : 'Save Backup Codes'}
          </Text>
        </Group>
      }
      centered
      size={step === 1 ? 'md' : 'lg'}
    >
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Notice" color="red" variant="light" mb="md" radius="md">
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack align="center" py="xl">
          <Loader size="md" color="indigo" />
          <Text size="sm" c="dimmed">Generating security keys...</Text>
        </Stack>
      ) : step === 1 ? (
        <TwoFactorQrStep
          setupData={setupData}
          verifyCode={verifyCode}
          onCodeChange={setVerifyCode}
          onSubmit={confirmCode}
          confirmLoading={confirmLoading}
        />
      ) : (
        <BackupCodesStep
          backupCodes={backupCodes}
          onDownload={() => downloadBackupCodes(accountEmail)}
          actionButton={
            <Button color="indigo" onClick={onClose}>
              Done
            </Button>
          }
        />
      )}
    </Modal>
  );
}
