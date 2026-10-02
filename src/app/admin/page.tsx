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
import UnconfirmedSignups, { type UnconfirmedRow } from '@/components/UnconfirmedSignups';
import AdminContacts, { type ContactRow } from '@/components/AdminContacts';
import AdminAttendance, { type AttendanceEvent } from '@/components/AdminAttendance';
import { CAREER_STAGES, ORGANISATION_TYPES, SKILLS } from '@/lib/profile';
import { TIER_LABELS, type Tier } from '@/lib/stripe';
import { getAllBootcamps } from '@/lib/content';

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

// Who is working through the bootcamps, and how far they have got.
const BOOTCAMP_COLUMNS: AdminColumn[] = [
  { key: 'first', label: 'First name' },
  { key: 'last', label: 'Last name' },
  { key: 'email', label: 'Email' },
  { key: 'bootcamp', label: 'Bootcamp' },
  { key: 'completed', label: 'Completed' },
  { key: 'total', label: 'Episodes' },
  { key: 'percent', label: 'Progress' },
  { key: 'episodes', label: 'Episodes done', minWidth: '18rem' },
  { key: 'lastActivity', label: 'Last activity', type: 'date' },
];


// PostgREST hands back at most a thousand rows per query, so anything that can
// outgrow that has to be read a page at a time. The contacts table passed a
// thousand the day the newsletter audience arrived, and the admin panel was
// quietly showing the first page of it, with the stage counts to match.
//
// Returns the same { data } shape the client gives, so the callers below read
// exactly as they did before.
async function allRows(
  table: string,
  columns: string,
  order?: { column: string; ascending?: boolean }
  // The admin panel works with these rows untyped, as the Supabase client hands
  // them over.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ data: any[] }> {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any[] = [];
  for (let from = 0; from < 200_000; from += 1000) {
    let query = admin.from(table).select(columns).range(from, from + 999);
    if (order) query = query.order(order.column, { ascending: order.ascending ?? true });
    const { data, error } = await query;
    if (error || !data || data.length === 0) break;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return { data: out };
}

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
  const [usersRes, profilesRes, subsRes, regsRes, progressRes, bootcamps, contactsRes, notesRes] =
    await Promise.all([
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      admin.from('profiles').select('*'),
      admin.from('subscriptions').select('*').in('status', ['active', 'trialing']),
      allRows('event_registrations', '*'),
      admin.from('bootcamp_progress').select('*'),
      getAllBootcamps(),
      // The funnel. Missing until supabase/schema.sql has been applied, so the
      // panel carries on without the tab rather than falling over.
      allRows('contacts', '*', { column: 'stage_changed_at', ascending: false }).catch(() => ({ data: [] })),
      allRows('contact_notes', '*', { column: 'created_at', ascending: false }).catch(() => ({ data: [] })),
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
    // Legacy, Corporate and Internal are manually-added memberships (no Stripe
    // tier) — they carry a plain plan_label; Stripe subscriptions render from
    // their tier. Internal is the team's own access, so it is labelled as such
    // rather than counted as a sale.
    const manual = s.source === 'legacy' || s.source === 'corporate' || s.source === 'internal';
    return {
      category:
        s.source === 'corporate'
          ? 'Corporate'
          : s.source === 'legacy'
            ? 'Legacy'
            : s.source === 'internal'
              ? 'Internal'
              : 'New',
      ...nameOf(s.user_id),
      plan: manual
        ? s.plan_label ?? '—'
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

  // Everybody who has an account and has never got into it, which comes in two
  // shapes. Some never clicked the link at all. Others had their address
  // confirmed within seconds by their own mail security, which used up the
  // link, and have been locked out ever since. Both need one email; the words
  // differ, and the panel says which is which.
  const unconfirmedRows: UnconfirmedRow[] = (usersRes.data?.users ?? [])
    .filter((u) => u.email && !u.last_sign_in_at)
    .map((u) => {
      const confirmedAt = u.email_confirmed_at;
      const gapSeconds = confirmedAt
        ? (new Date(confirmedAt).getTime() - new Date(u.created_at).getTime()) / 1000
        : null;
      return {
        id: u.id,
        email: u.email ?? '',
        name: [u.user_metadata?.first_name, u.user_metadata?.last_name].filter(Boolean).join(' '),
        signedUp: u.created_at,
        lastReminder: (u.app_metadata?.confirmation_reminder_sent_at as string | undefined) ?? null,
        reminders: Number(u.app_metadata?.confirmation_reminders) || 0,
        kind: !confirmedAt
          ? ('never confirmed' as const)
          : gapSeconds !== null && gapSeconds < 120
            ? ('link eaten by mail security' as const)
            : ('confirmed, never signed in' as const),
      };
    })
    .sort((a, b) => b.signedUp.localeCompare(a.signedUp));

  // One row per user per bootcamp they have started. Episode totals come from
  // Sanity so the denominator tracks whatever has actually been published.
  const episodeIndex = new Map<string, { bootcamp: string; label: string; total: number }>();
  for (const b of bootcamps) {
    for (const e of b.episodes) {
      episodeIndex.set(e.slug, { bootcamp: b.title, label: e.label, total: b.episodes.length });
    }
  }

  const byUserBootcamp = new Map<
    string,
    { userId: string; bootcamp: string; total: number; labels: string[]; last: string }
  >();
  for (const row of progressRes.data ?? []) {
    const meta = episodeIndex.get(row.article_slug);
    const bootcamp = meta?.bootcamp ?? row.bootcamp_slug ?? 'Unknown';
    const key = `${row.user_id}::${bootcamp}`;
    const entry = byUserBootcamp.get(key) ?? {
      userId: row.user_id,
      bootcamp,
      total: meta?.total ?? 0,
      labels: [] as string[],
      last: '',
    };
    entry.labels.push(meta?.label ?? row.episode_label ?? row.article_slug);
    if (!entry.last || (row.completed_at ?? '') > entry.last) entry.last = row.completed_at ?? '';
    byUserBootcamp.set(key, entry);
  }

  const bootcampRows = [...byUserBootcamp.values()].map((e) => ({
    ...nameOf(e.userId),
    bootcamp: e.bootcamp,
    completed: String(e.labels.length),
    total: String(e.total),
    percent: e.total ? `${Math.round((e.labels.length / e.total) * 100)}%` : '—',
    episodes: e.labels.sort().join(', '),
    lastActivity: e.last,
  }));

  const notesByContact = new Map<string, ContactRow['notes']>();
  for (const n of notesRes.data ?? []) {
    const list = notesByContact.get(n.contact_id) ?? [];
    list.push({ body: n.body, author: n.author, createdAt: n.created_at });
    notesByContact.set(n.contact_id, list);
  }

  const contactRows: ContactRow[] = (contactsRes.data ?? []).map((c) => ({
    id: c.id,
    name: [c.first_name, c.last_name].filter(Boolean).join(' ').trim() || '—',
    email: c.email,
    company: c.company ?? null,
    stage: c.stage ?? 'lead',
    stageChangedAt: c.stage_changed_at ?? null,
    source: c.acquisition_source ?? null,
    clientType: c.client_type ?? null,
    membership: c.membership_status
      ? [c.membership_plan ?? c.membership_tier, c.membership_status].filter(Boolean).join(' · ')
      : null,
    events: c.events_registered ?? 0,
    infoSessions: { registered: c.info_sessions_registered ?? 0, attended: c.info_sessions_attended ?? 0, missed: c.info_session_no_shows ?? 0 },
    workshops: { registered: c.workshops_registered ?? 0, attended: c.workshops_attended ?? 0, missed: c.workshop_no_shows ?? 0 },
    freeWorkshopUsedAt: c.free_workshop_used_at ?? null,
    renewal: c.renewal_status ?? 'none',
    followUpOn: c.follow_up_on ?? null,
    bootcampDays: c.bootcamp_days_done ?? 0,
    newsletter: c.newsletter_status ?? 'none',
    optedIn: Boolean(c.newsletter_opt_in),
    openRate: c.open_rate ?? null,
    clicks: c.emails_clicked ?? null,
    emailsSent: c.emails_sent ?? null,
    status: (c.status ?? 'active') as 'active' | 'junk',
    notes: notesByContact.get(c.id) ?? [],
  }));

  // Past events, newest first, each with everyone who registered. Only events
  // that have happened: ticking attendance on a future one makes no sense.
  const contactByUser = new Map((contactsRes.data ?? []).map((c) => [c.user_id, c]));
  const eventsBySlug = new Map<string, AttendanceEvent>();
  for (const r of regsRes.data ?? []) {
    const start = r.event_start ? new Date(r.event_start) : null;
    if (start && start.getTime() > Date.now()) continue;
    const existing: AttendanceEvent = eventsBySlug.get(r.event_slug) ?? {
      slug: r.event_slug,
      title: r.event_title ?? r.event_slug,
      start: r.event_start ?? null,
      kind: (r.event_kind ?? (/info-session|live-demo/.test(r.event_slug) ? 'info_session' : 'workshop')) as AttendanceEvent['kind'],
      registrations: [] as AttendanceEvent['registrations'],
    };
    const contact = contactByUser.get(r.user_id);
    const who = nameOf(r.user_id);
    existing.registrations.push({
      userId: r.user_id,
      contactId: contact?.id ?? null,
      name: [who.first, who.last].filter(Boolean).join(' ').trim() || '—',
      email: who.email,
      attended: Boolean(r.attended_at),
      freeWorkshopEvent: contact?.free_workshop_event ?? null,
    });
    eventsBySlug.set(r.event_slug, existing);
  }
  const attendanceEvents = [...eventsBySlug.values()].sort(
    (a, b) => new Date(b.start ?? 0).getTime() - new Date(a.start ?? 0).getTime()
  );

  const tabs: AdminTab[] = [
    ...(contactRows.length > 0
      ? [
          {
            id: 'contacts',
            label: 'Contacts',
            count: contactRows.filter((c) => c.status === 'active').length,
            content: <AdminContacts rows={contactRows} />,
          },
          ...(attendanceEvents.length > 0
            ? [
                {
                  id: 'attendance',
                  label: 'Attendance',
                  count: attendanceEvents.length,
                  content: <AdminAttendance events={attendanceEvents} />,
                },
              ]
            : []),
        ]
      : []),
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
      id: 'unconfirmed',
      label: 'Unconfirmed signups',
      count: unconfirmedRows.length,
      content: <UnconfirmedSignups rows={unconfirmedRows} />,
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
      id: 'bootcamps',
      label: 'Bootcamp progress',
      count: bootcampRows.length,
      content: (
        <div>
          <p className="text-sm text-ink/55 mb-4 max-w-2xl">
            Everyone who has marked at least one bootcamp episode complete, one row per person per
            bootcamp. Episode totals come from what is published, so the percentage moves as you add
            episodes.
          </p>
          <AdminTable
            title="bootcamp progress"
            columns={BOOTCAMP_COLUMNS}
            rows={bootcampRows}
            defaultSortKey="lastActivity"
            defaultSortDir="desc"
          />
        </div>
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
