import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminEmail } from '@/lib/admin';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import { CAREER_STAGES, ORGANISATION_TYPES, SKILLS } from '@/lib/profile';
import { TIER_LABELS, type Tier } from '@/lib/stripe';

export const metadata: Metadata = {
  title: 'admin',
  robots: { index: false, follow: false },
};

const careerLabel = Object.fromEntries(CAREER_STAGES.map((o) => [o.value, o.label]));
const orgLabel = Object.fromEntries(ORGANISATION_TYPES.map((o) => [o.value, o.label]));
const skillLabel = Object.fromEntries(SKILLS.map((o) => [o.value, o.label]));

function fmtDate(d?: string | null): string {
  return d
    ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
}

const th = 'px-3 py-2 text-left font-semibold text-ink whitespace-nowrap';
const td = 'px-3 py-2 align-top text-ink/80';

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
    admin.from('event_registrations').select('*').order('created_at', { ascending: false }),
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
      first: p?.first_name ?? m?.first_name ?? '—',
      last: p?.last_name ?? m?.last_name ?? '—',
      email: p?.email ?? emailBy.get(uid) ?? '—',
    };
  };

  const memberships = (subsRes.data ?? [])
    .map((s) => {
      const n = nameOf(s.user_id);
      return {
        ...n,
        plan: `${TIER_LABELS[s.tier as Tier] ?? s.tier ?? '—'} · ${s.billing_interval === 'year' ? 'Annual' : 'Monthly'}`,
        started: fmtDate(s.created_at),
        expiry: s.current_period_end
          ? `${s.cancel_at_period_end ? 'Ends' : 'Renews'} ${fmtDate(s.current_period_end)}`
          : '—',
      };
    })
    .sort((a, b) => `${a.last}${a.first}`.localeCompare(`${b.last}${b.first}`));

  const registrations = (regsRes.data ?? []).map((r) => {
    const n = nameOf(r.user_id);
    const p = profileBy.get(r.user_id);
    return {
      ...n,
      event: r.event_title ?? r.event_slug,
      registered: fmtDate(r.created_at),
      phone: p?.phone || '—',
      career: p?.career_stage ? careerLabel[p.career_stage] ?? p.career_stage : '—',
      org: p?.organisation_type ? orgLabel[p.organisation_type] ?? p.organisation_type : '—',
      employer: p?.current_employer || '—',
      skills: (p?.skills ?? []).map((v: string) => skillLabel[v] ?? v).join(', ') || '—',
      optIn: p?.email_opt_in ? 'Yes' : 'No',
    };
  });

  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-6xl mx-auto">
          <h1 className="display text-3xl text-ink mb-1">admin</h1>
          <p className="text-ink/60 mb-10">Signed in as {user.email}</p>

          {/* Memberships */}
          <section className="mb-14">
            <h2 className="display text-xl text-ink mb-1">
              current memberships <span className="text-ink/40">({memberships.length})</span>
            </h2>
            <p className="text-sm text-ink/55 mb-4">Active and trialing members.</p>
            <div className="overflow-x-auto rounded-[2px] border border-rule/20">
              <table className="w-full text-sm">
                <thead className="bg-ink/[0.04]">
                  <tr>
                    <th className={th}>First name</th>
                    <th className={th}>Last name</th>
                    <th className={th}>Email</th>
                    <th className={th}>Plan</th>
                    <th className={th}>Started</th>
                    <th className={th}>Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {memberships.length === 0 ? (
                    <tr><td className={td} colSpan={6}>No active memberships.</td></tr>
                  ) : (
                    memberships.map((m, i) => (
                      <tr key={i} className="border-t border-rule/10">
                        <td className={td}>{m.first}</td>
                        <td className={td}>{m.last}</td>
                        <td className={td}>{m.email}</td>
                        <td className={td}>{m.plan}</td>
                        <td className={`${td} whitespace-nowrap`}>{m.started}</td>
                        <td className={`${td} whitespace-nowrap`}>{m.expiry}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Event registrations */}
          <section>
            <h2 className="display text-xl text-ink mb-1">
              event registrations <span className="text-ink/40">({registrations.length})</span>
            </h2>
            <p className="text-sm text-ink/55 mb-4">Everyone registered for events, with their profile details.</p>
            <div className="overflow-x-auto rounded-[2px] border border-rule/20">
              <table className="w-full text-sm">
                <thead className="bg-ink/[0.04]">
                  <tr>
                    <th className={th}>First name</th>
                    <th className={th}>Last name</th>
                    <th className={th}>Email</th>
                    <th className={th}>Event</th>
                    <th className={th}>Registered</th>
                    <th className={th}>Phone</th>
                    <th className={th}>Career stage</th>
                    <th className={th}>Organisation</th>
                    <th className={th}>Employer</th>
                    <th className={th}>Skills to grow</th>
                    <th className={th}>Email opt-in</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.length === 0 ? (
                    <tr><td className={td} colSpan={11}>No registrations yet.</td></tr>
                  ) : (
                    registrations.map((r, i) => (
                      <tr key={i} className="border-t border-rule/10">
                        <td className={td}>{r.first}</td>
                        <td className={td}>{r.last}</td>
                        <td className={td}>{r.email}</td>
                        <td className={td}>{r.event}</td>
                        <td className={`${td} whitespace-nowrap`}>{r.registered}</td>
                        <td className={td}>{r.phone}</td>
                        <td className={td}>{r.career}</td>
                        <td className={td}>{r.org}</td>
                        <td className={td}>{r.employer}</td>
                        <td className={`${td} min-w-[16rem]`}>{r.skills}</td>
                        <td className={td}>{r.optIn}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
