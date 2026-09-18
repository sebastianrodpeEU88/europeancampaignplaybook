'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminEmail } from '@/lib/admin';
import { routes } from '@/lib/routes';

export type ReminderResult = { ok: true; sentAt: string } | { ok: false; error: string };

// A day between reminders, so nobody gets several in a row.
const REMINDER_COOLDOWN_MS = 24 * 60 * 60 * 1000;

// Emails a fresh sign-in link to someone who started signing up but never
// clicked the first one. Sign-in is passwordless, so clicking it confirms the
// account and signs them in, same as the original signup link. Admin only; the
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

  const lastSent = target.app_metadata?.confirmation_reminder_sent_at as string | undefined;
  if (lastSent && Date.now() - new Date(lastSent).getTime() < REMINDER_COOLDOWN_MS) {
    return { ok: false, error: 'Already reminded in the last 24 hours.' };
  }

  const { error: sendError } = await admin.auth.signInWithOtp({
    email: target.email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirectTo=${encodeURIComponent(routes.account())}`,
    },
  });
  if (sendError) return { ok: false, error: sendError.message };

  const sentAt = new Date().toISOString();
  await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...target.app_metadata,
      confirmation_reminder_sent_at: sentAt,
      confirmation_reminders: (Number(target.app_metadata?.confirmation_reminders) || 0) + 1,
    },
  });
  revalidatePath(routes.admin());
  return { ok: true, sentAt };
}
