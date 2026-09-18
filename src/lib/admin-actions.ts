'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminEmail } from '@/lib/admin';
import { deliverConfirmationReminder } from '@/lib/confirmation-reminder';
import { routes } from '@/lib/routes';

export type ReminderResult = { ok: true; sentAt: string } | { ok: false; error: string };

async function adminEmail(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isAdminEmail(user?.email) ? user!.email! : null;
}

// Sends the one and only reminder to someone who started signing up but never
// clicked the first link. The site sends it (src/lib/email.ts), quoting the
// date they signed up; its link signs them in, which confirms the account.
// Admin only; the check is repeated here because a server action can be
// called directly.
export async function sendConfirmationReminder(userId: string): Promise<ReminderResult> {
  if (!(await adminEmail())) return { ok: false, error: 'Not allowed.' };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  const target = data?.user;
  if (error || !target?.email) return { ok: false, error: 'Account not found.' };
  if (target.email_confirmed_at) return { ok: false, error: 'Already confirmed.' };
  if (target.app_metadata?.confirmation_reminder_sent_at) {
    return { ok: false, error: 'The final reminder has already been sent.' };
  }

  const result = await deliverConfirmationReminder({ email: target.email, signedUpAt: target.created_at });
  if (!result.ok) return result;

  const sentAt = new Date().toISOString();
  await admin.auth.admin.updateUserById(userId, {
    app_metadata: { ...target.app_metadata, confirmation_reminder_sent_at: sentAt, confirmation_reminders: 1 },
  });
  revalidatePath(routes.admin());
  return { ok: true, sentAt };
}

// Emails the admin the exact reminder, dated `signedUpAt`, before anyone else
// gets it. Its button signs the admin in, so it is safe to click.
export async function sendConfirmationReminderPreview(signedUpAt: string): Promise<ReminderResult> {
  const email = await adminEmail();
  if (!email) return { ok: false, error: 'Not allowed.' };
  const result = await deliverConfirmationReminder({ email, signedUpAt, preview: true });
  return result.ok ? { ok: true, sentAt: new Date().toISOString() } : result;
}
