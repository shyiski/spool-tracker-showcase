import React from 'react';
import { Container, Stack, Loader, Text, Button, Group } from '@mantine/core';
import { useAuth } from './hooks/useAuth.js';
import { Navbar, Footer } from './components/layout/index.js';
import { AuthCard } from './components/auth/index.js';
import { TwoFactorOnboarding } from './components/two-factor/index.js';
import { ProfileSetup } from './components/profile/ProfileSetup.jsx';
import { Dashboard, UsersTable, AuditTable } from './components/dashboard/index.js';

export default function App() {
  const {
    currentUser,
    authLoading,
    dbStatus,
    currentView,
    setCurrentView,
    checkAuth,
    handleAuthSuccess,
    handleRegisterSuccess,
    handle2FAOnboardingComplete,
    handleProfileComplete,
    handleLogout
  } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentUser={currentUser}
        dbStatus={dbStatus}
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '32px 16px' }}>
        <Container size="lg" style={{ width: '100%' }}>
          {authLoading ? (
            <Stack align="center" py="xl">
              <Loader size="lg" color="indigo" />
              <Text size="sm" c="dimmed">Connecting to system...</Text>
            </Stack>
          ) : currentView === 'auth' || !currentUser ? (
            <AuthCard
              onAuthSuccess={handleAuthSuccess}
              onRegisterSuccess={handleRegisterSuccess}
            />
          ) : currentView === 'setup-2fa' ? (
            <div className="fade-in">
              <TwoFactorOnboarding
                user={currentUser}
                onComplete={handle2FAOnboardingComplete}
                onSkip={() => setCurrentView(currentUser?.gender ? 'users-table' : 'profile-setup')}
                onCancel={currentUser ? () => setCurrentView('users-table') : undefined}
              />
            </div>
          ) : currentView === 'profile-setup' ? (
            <div className="fade-in">
              <ProfileSetup
                user={currentUser}
                onComplete={handleProfileComplete}
                onCancel={currentUser?.profile_completed ? () => setCurrentView('users-table') : undefined}
              />
            </div>
          ) : currentView === 'users-table' ? (
            <div className="fade-in">
              <UsersTable currentUser={currentUser} />
            </div>
          ) : currentView === 'dashboard' ? (
            <div className="fade-in">
              <Dashboard
                user={currentUser}
                onUserUpdate={checkAuth}
                onLogout={handleLogout}
              />
            </div>
          ) : (
            <div className="fade-in">
              <Stack gap="md">
                <Group justify="flex-start">
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={() => setCurrentView(currentUser ? 'users-table' : 'auth')}
                  >
                    ← Back
                  </Button>
                </Group>
                <AuditTable />
              </Stack>
            </div>
          )}
        </Container>
      </main>

      <Footer dbStatus={dbStatus} />
    </div>
  );
}
