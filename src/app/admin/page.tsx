import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminEmail } from '@/lib/admin';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import AdminTable, { type AdminColumn } from '@/components/AdminTable';
import { CAREER_STAGES, ORGANISATION_TYPES, SKILLS } from '@/lib/profile';
import { TIER_LABELS, type Tier } from '@/lib/stripe';

export const metadata: Metadata = {
  title: 'admin',
  robots: { index: false, follow: false },
};

const careerLabel = Object.fromEntries(CAREER_STAGES.map((o) => [o.value, o.label]));
const orgLabel = Object.fromEntries(ORGANISATION_TYPES.map((o) => [o.value, o.label]));
const skillLabel = Object.fromEntries(SKILLS.map((o) => [o.value, o.label]));

const MEMBERSHIP_COLUMNS: AdminColumn[] = [
  { key: 'category', label: 'Category' },
  { key: 'first', label: 'First name' },
  { key: 'last', label: 'Last name' },
  { key: 'email', label: 'Email' },
  { key: 'plan', label: 'Plan' },
  { key: 'started', label: 'Started', type: 'date' },
  { key: 'renews', label: 'Expiry', type: 'date' },
  { key: 'autoRenew', label: 'Auto-renew' },
];

const REGISTRATION_COLUMNS: AdminColumn[] = [
  { key: 'first', label: 'First name' },
  { key: 'last', label: 'Last name' },
  { key: 'email', label: 'Email' },
  { key: 'event', label: 'Event' },
  { key: 'registered', label: 'Registered', type: 'date' },
  { key: 'phone', label: 'Phone' },
  { key: 'career', label: 'Career stage' },
  { key: 'org', label: 'Organisation' },
  { key: 'employer', label: 'Employer' },
  { key: 'skills', label: 'Skills to grow', minWidth: '16rem' },
  { key: 'optIn', label: 'Email opt-in' },
];

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`${routes.login()}?redirectTo=${encodeURIComponent(routes.admin())}`);
  }
  if (!isAdminEmail(user.email)) {
    notFound();
  }

  const admin = createAdminClient();
  const [usersRes, profilesRes, subsRes, regsRes] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('profiles').select('*'),
    admin.from('subscriptions').select('*').in('status', ['active', 'trialing']),
    admin.from('event_registrations').select('*'),
  ]);

  const emailBy = new Map((usersRes.data?.users ?? []).map((u) => [u.id, u.email ?? '']));
  const metaBy = new Map(
    (usersRes.data?.users ?? []).map((u) => [
      u.id,
      (u.user_metadata ?? {}) as { first_name?: string; last_name?: string },
    ])
  );
  const profileBy = new Map((profilesRes.data ?? []).map((p) => [p.user_id, p]));

  const nameOf = (uid: string) => {
    const p = profileBy.get(uid);
    const m = metaBy.get(uid);
    return {
      first: p?.first_name ?? m?.first_name ?? '',
      last: p?.last_name ?? m?.last_name ?? '',
      email: p?.email ?? emailBy.get(uid) ?? '',
    };
  };

  const membershipRows = (subsRes.data ?? []).map((s) => {
    const legacy = s.source === 'legacy';
    return {
      category: legacy ? 'Legacy' : 'New',
      ...nameOf(s.user_id),
      plan: legacy
        ? s.plan_label ?? 'Legacy'
        : `${TIER_LABELS[s.tier as Tier] ?? s.tier ?? '—'} · ${s.billing_interval === 'year' ? 'Annual' : 'Monthly'}`,
      started: s.created_at ?? '',
      renews: s.current_period_end ?? '',
      autoRenew: s.cancel_at_period_end ? 'No (ends)' : 'Yes',
    };
  });

  const registrationRows = (regsRes.data ?? []).map((r) => {
    const p = profileBy.get(r.user_id);
    return {
      ...nameOf(r.user_id),
      event: r.event_title ?? r.event_slug,
      registered: r.created_at ?? '',
      phone: p?.phone ?? '',
      career: p?.career_stage ? careerLabel[p.career_stage] ?? p.career_stage : '',
      org: p?.organisation_type ? orgLabel[p.organisation_type] ?? p.organisation_type : '',
      employer: p?.current_employer ?? '',
      skills: (p?.skills ?? []).map((v: string) => skillLabel[v] ?? v).join(', '),
      optIn: p?.email_opt_in ? 'Yes' : 'No',
    };
  });

  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-6xl mx-auto">
          <h1 className="display text-3xl text-ink mb-1">admin</h1>
          <p className="text-ink/60 mb-10">
            Signed in as {user.email}. Click a column to sort; filter and copy each table below.
          </p>

          <AdminTable
            title="current memberships"
            columns={MEMBERSHIP_COLUMNS}
            rows={membershipRows}
            defaultSortKey="last"
            defaultSortDir="asc"
          />

          <AdminTable
            title="event registrations"
            columns={REGISTRATION_COLUMNS}
            rows={registrationRows}
            defaultSortKey="registered"
            defaultSortDir="desc"
          />
        </div>
      </Container>
    </div>
  );
}
