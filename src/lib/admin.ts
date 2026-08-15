// Super-user allowlist. Defaults to the founder's email so admin works with no
// configuration; override/extend with ADMIN_EMAILS (comma-separated) in the env.
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS || 'sebastian@campaignplaybook.eu')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}
