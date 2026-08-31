// Super-user allowlist. Hardcoded to the founder's single account as a critical
// data-protection measure: the admin dashboard exposes every member's personal
// data, so access must never be broadenable by an env misconfiguration. To add
// another admin in future, add their email to this list deliberately, in code.
const ADMIN_EMAILS = ['sebastian@campaignplaybook.eu'];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
