import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { sendConfirmationReminderEmail } from '@/lib/email';
import { routes } from '@/lib/routes';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.campaignplaybook.eu';

const signupDateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Brussels',
});

// A one-click link the site can email itself. Clicking it signs the person in
// through /auth/confirm; for someone who never confirmed, that also confirms
// the account. No email is sent by Supabase when the link is generated.
async function signInLink(email: string): Promise<string | null> {
  const { data, error } = await createAdminClient().auth.admin.generateLink({ type: 'magiclink', email });
  if (error || !data?.properties?.hashed_token) return null;
  const { hashed_token, verification_type } = data.properties;
  const params = new URLSearchParams({ token_hash: hashed_token, type: verification_type, next: routes.account() });
  return `${SITE}/auth/confirm?${params}`;
}

// Sends the final reminder to `email`, quoting the date the account was
// created. A preview is the same email sent to the admin's own address, so its
// link signs the admin in and is safe to click.
export async function deliverConfirmationReminder({
  email,
  signedUpAt,
}: {
  email: string;
  signedUpAt: string | Date;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const confirmUrl = await signInLink(email);
  if (!confirmUrl) return { ok: false, error: 'Could not create a sign-in link.' };
  const sent = await sendConfirmationReminderEmail(email, {
    signupDate: signupDateFmt.format(new Date(signedUpAt)),
    confirmUrl,
  });
  return sent ? { ok: true } : { ok: false, error: 'The email could not be sent.' };
}
