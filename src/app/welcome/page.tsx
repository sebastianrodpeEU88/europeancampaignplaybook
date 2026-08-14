import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import ProfileForm from '@/components/ProfileForm';
import type { ProfileRow } from '@/lib/profile';

export const metadata: Metadata = {
  title: 'welcome',
  description: 'Tell us a little about you to personalise your European Campaign Playbook experience.',
};

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`${routes.login()}?redirectTo=${encodeURIComponent(routes.welcome())}`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, phone, career_stage, organisation_type, current_employer, skills, email_opt_in')
    .eq('user_id', user.id)
    .maybeSingle();

  const safeNext = typeof next === 'string' && next.startsWith('/') ? next : routes.account();

  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-xl mx-auto">
          <h1 className="display text-3xl text-ink mb-2">welcome</h1>
          <p className="text-ink/60 mb-8 leading-relaxed">
            Tell us a little about you — it takes a minute. Only your name and email are required;
            everything else is optional and helps us tailor things to you.
          </p>
          <ProfileForm
            initial={(profile as ProfileRow) ?? null}
            defaultEmail={user.email ?? ''}
            next={safeNext}
            showError={error === '1'}
          />
        </div>
      </Container>
    </div>
  );
}
