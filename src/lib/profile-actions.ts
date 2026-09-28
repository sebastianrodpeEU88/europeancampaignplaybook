'use server';

import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SELF_EMPLOYED } from '@/lib/profile';
import { routes } from '@/lib/routes';
import { refreshContactForUser } from '@/lib/crm/contacts';
import { drainContactSyncQueue } from '@/lib/crm/sync';

// Saves the onboarding profile for the signed-in user. Mandatory fields are
// also enforced client-side (HTML required); this re-checks defensively.
export async function saveProfile(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(routes.login());
  }

  const str = (key: string) => {
    const v = formData.get(key);
    return typeof v === 'string' ? v.trim() : '';
  };

  const firstName = str('first_name');
  const lastName = str('last_name');
  const email = str('email');
  const nextRaw = str('next');
  const next = nextRaw.startsWith('/') ? nextRaw : routes.account();

  if (!firstName || !lastName || !email) {
    redirect(`${routes.welcome()}?next=${encodeURIComponent(next)}&error=1`);
  }

  const organisationType = str('organisation_type') || null;
  const skills = formData.getAll('skills').map(String);
  const phone = str('phone') || null;
  const careerStage = str('career_stage') || null;
  const company = organisationType === SELF_EMPLOYED ? null : str('current_employer') || null;
  const optIn = formData.get('email_opt_in') === 'on';

  await supabase.from('profiles').upsert(
    {
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      career_stage: careerStage,
      organisation_type: organisationType,
      current_employer: company,
      skills,
      email_opt_in: optIn,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  // The profile write already refreshed this person's contact through the
  // database trigger, which queued the push to Notion and beehiiv. Draining
  // the queue AFTER the response keeps onboarding fast and leaves a slow or
  // failing third-party API to the next run instead of the person in front of
  // us. Nothing is lost either way: the queue holds the work.
  after(async () => {
    await refreshContactForUser(user.id);
    await drainContactSyncQueue(5);
  });

  redirect(next);
}
