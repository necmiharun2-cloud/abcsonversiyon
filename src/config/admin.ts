/**
 * Admin rolü otomatik ataması için e-postalar (virgülle ayrılmış, .env: VITE_ADMIN_EMAILS)
 */
export function getAdminEmails(): string[] {
  const raw = import.meta.env.VITE_ADMIN_EMAILS as string | undefined;
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase().trim());
}
