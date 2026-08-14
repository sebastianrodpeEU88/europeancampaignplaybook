'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SELF_EMPLOYED } from '@/lib/profile';
import { routes } from '@/lib/routes';

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

  await supabase.from('profiles').upsert(
    {
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: str('phone') || null,
      career_stage: str('career_stage') || null,
      organisation_type: organisationType,
      current_employer: organisationType === SELF_EMPLOYED ? null : str('current_employer') || null,
      skills,
      email_opt_in: formData.get('email_opt_in') === 'on',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  redirect(next);
}
