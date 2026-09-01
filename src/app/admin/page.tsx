import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminEmail } from '@/lib/admin';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import AdminTable, { type AdminColumn } from '@/components/AdminTable';
import AdminTabs, { type AdminTab } from '@/components/AdminTabs';
import CashflowChart from '@/components/CashflowChart';
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
  { key: 'monthlyTotal', label: 'Monthly total', type: 'currency' },
  { key: 'yearlyTotal', label: 'Yearly total', type: 'currency' },
  { key: 'started', label: 'Started', type: 'date' },
  { key: 'renews', label: 'Expiry', type: 'date' },
  { key: 'autoRenew', label: 'Auto-renew' },
];

const MONTHS_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

// Registered accounts that have completed onboarding but are not paying members
// yet — the conversion/leads list.
const PROSPECT_COLUMNS: AdminColumn[] = [
  { key: 'first', label: 'First name' },
  { key: 'last', label: 'Last name' },
  { key: 'email', label: 'Email' },
  { key: 'signedUp', label: 'Signed up', type: 'date' },
  { key: 'career', label: 'Career stage' },
  { key: 'org', label: 'Organisation' },
  { key: 'employer', label: 'Employer' },
  { key: 'phone', label: 'Phone' },
  { key: 'events', label: 'Events registered' },
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
      monthlyTotal: s.monthly_amount != null ? String(s.monthly_amount) : '',
      yearlyTotal: s.yearly_amount != null ? String(s.yearly_amount) : '',
      started: s.created_at ?? '',
      renews: s.current_period_end ?? '',
      autoRenew: s.cancel_at_period_end ? 'No (ends)' : 'Yes',
    };
  });

  // Projected cashflow by month: monthly plans contribute their monthly amount
  // each month up to expiry; annual plans contribute their yearly amount in
  // their expiry (renewal) month.
  const now = new Date();
  const startKey = now.getUTCFullYear() * 12 + now.getUTCMonth();
  let endKey = startKey;
  for (const s of subsRes.data ?? []) {
    if (!s.current_period_end) continue;
    const e = new Date(s.current_period_end);
    endKey = Math.max(endKey, e.getUTCFullYear() * 12 + e.getUTCMonth());
  }
  endKey = Math.min(endKey, startKey + 23); // cap the horizon at 24 months
  const buckets = Array.from({ length: endKey - startKey + 1 }, (_, i) => {
    const k = startKey + i;
    return { y: Math.floor(k / 12), m: k % 12, legacy: 0, new: 0 };
  });
  for (const s of subsRes.data ?? []) {
    if (!s.current_period_end) continue;
    const e = new Date(s.current_period_end);
    const eKey = e.getUTCFullYear() * 12 + e.getUTCMonth();
    const monthly = Number(s.monthly_amount) || 0;
    const yearly = Number(s.yearly_amount) || 0;
    const series: 'legacy' | 'new' = s.source === 'legacy' ? 'legacy' : 'new';
    if (s.billing_interval === 'month' && monthly > 0) {
      for (const b of buckets) if (b.y * 12 + b.m <= eKey) b[series] += monthly;
    } else if (s.billing_interval === 'year' && yearly > 0) {
      const b = buckets.find((x) => x.y * 12 + x.m === eKey);
      if (b) b[series] += yearly;
    }
  }
  const cashflow = buckets.map((b) => ({
    label: `${MONTHS_ABBR[b.m]} ${b.y}`,
    legacy: b.legacy,
    new: b.new,
  }));

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

  // Registered but not yet members: onboarded profiles without an active
  // subscription. Bots/abandoned signups have no profile, so they're excluded.
  const memberIds = new Set((subsRes.data ?? []).map((s) => s.user_id));
  const eventCountBy = new Map<string, number>();
  for (const r of regsRes.data ?? []) {
    eventCountBy.set(r.user_id, (eventCountBy.get(r.user_id) ?? 0) + 1);
  }
  const prospectRows = (profilesRes.data ?? [])
    .filter((p) => !memberIds.has(p.user_id))
    .map((p) => ({
      ...nameOf(p.user_id),
      signedUp: p.created_at ?? '',
      career: p.career_stage ? careerLabel[p.career_stage] ?? p.career_stage : '',
      org: p.organisation_type ? orgLabel[p.organisation_type] ?? p.organisation_type : '',
      employer: p.current_employer ?? '',
      phone: p.phone ?? '',
      events: String(eventCountBy.get(p.user_id) ?? 0),
      optIn: p.email_opt_in ? 'Yes' : 'No',
    }));

  const tabs: AdminTab[] = [
    {
      id: 'memberships',
      label: 'Current memberships',
      count: membershipRows.length,
      content: (
        <AdminTable
          title="current memberships"
          columns={MEMBERSHIP_COLUMNS}
          rows={membershipRows}
          defaultSortKey="last"
          defaultSortDir="asc"
        />
      ),
    },
    {
      id: 'prospects',
      label: 'Registered · not yet members',
      count: prospectRows.length,
      content: (
        <div>
          <p className="text-sm text-ink/55 mb-4 max-w-2xl">
            People who created an account and completed onboarding but haven&rsquo;t become paying
            members yet — your conversion list. (Excludes unconfirmed/abandoned signups, which never
            complete a profile.)
          </p>
          <AdminTable
            title="registered · not yet members"
            columns={PROSPECT_COLUMNS}
            rows={prospectRows}
            defaultSortKey="signedUp"
            defaultSortDir="desc"
          />
        </div>
      ),
    },
    {
      id: 'registrations',
      label: 'Event registrations',
      count: registrationRows.length,
      content: (
        <AdminTable
          title="event registrations"
          columns={REGISTRATION_COLUMNS}
          rows={registrationRows}
          defaultSortKey="registered"
          defaultSortDir="desc"
        />
      ),
    },
    {
      id: 'cashflow',
      label: 'Cashflow',
      content: (
        <section>
          <h2 className="display text-xl text-ink mb-1">cashflow</h2>
          <p className="text-sm text-ink/55 mb-4">
            Projected income by month from active memberships — recurring monthly totals until
            expiry, and annual totals on each renewal date.
          </p>
          <CashflowChart data={cashflow} />
        </section>
      ),
    },
  ];

  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-6xl mx-auto">
          <h1 className="display text-3xl text-ink mb-1">admin</h1>
          <p className="text-ink/60 mb-8">
            Signed in as {user.email}. Pick a section below; click a column to sort, filter and copy
            each table.
          </p>

          <AdminTabs tabs={tabs} />
        </div>
      </Container>
    </div>
  );
}
