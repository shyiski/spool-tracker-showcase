export function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatTime(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function getUserInitials(user) {
  const name = user?.username || user?.email || 'U';
  return name.slice(0, 2).toUpperCase();
}

export function isTwoFactorActive(user) {
  return Boolean(user?.two_factor_enabled === 1 || user?.two_factor_enabled === true);
}
