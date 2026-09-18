'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminEmail } from '@/lib/admin';
import { routes } from '@/lib/routes';

export type ReminderResult = { ok: true; sentAt: string } | { ok: false; error: string };

const signupDateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Brussels',
});

// Sends the one and only reminder to someone who started signing up but never
// clicked the first link. The email is Supabase's own sign-in email: setting
// `reminder` and the signup date on the user just before sending switches its
// template to the reminder wording (supabase/email-templates/). Sign-in is
// passwordless, so clicking the link confirms the account. Admin only; the
// check is repeated here because a server action can be called directly.
export async function sendConfirmationReminder(userId: string): Promise<ReminderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) return { ok: false, error: 'Not allowed.' };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  const target = data?.user;
  if (error || !target?.email) return { ok: false, error: 'Account not found.' };
  if (target.email_confirmed_at) return { ok: false, error: 'Already confirmed.' };
  if (target.app_metadata?.confirmation_reminder_sent_at) {
    return { ok: false, error: 'The final reminder has already been sent.' };
  }

  await admin.auth.admin.updateUserById(userId, {
    user_metadata: { reminder: true, reminder_signup_date: signupDateFmt.format(new Date(target.created_at)) },
  });
  const { error: sendError } = await admin.auth.signInWithOtp({
    email: target.email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirectTo=${encodeURIComponent(routes.account())}`,
    },
  });
  // The flag only matters while the email renders; clear it either way so any
  // later sign-in email goes out with the normal wording.
  await admin.auth.admin.updateUserById(userId, {
    user_metadata: { reminder: null, reminder_signup_date: null },
  });
  if (sendError) return { ok: false, error: sendError.message };

  const sentAt = new Date().toISOString();
  await admin.auth.admin.updateUserById(userId, {
    app_metadata: { ...target.app_metadata, confirmation_reminder_sent_at: sentAt, confirmation_reminders: 1 },
  });
  revalidatePath(routes.admin());
  return { ok: true, sentAt };
}
