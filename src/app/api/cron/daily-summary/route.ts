import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendAdminEmail } from '@/lib/email';
import { TIER_LABELS, type Tier } from '@/lib/stripe';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Scheduled by vercel.json. Vercel sends Authorization: Bearer ${CRON_SECRET}.
// Emails a digest of the last 24h of activity (new accounts, event sign-ups,
// new members, newsletter opt-ins) to the team.
const DIGEST_TO = process.env.DIGEST_TO || 'sebastian@campaignplaybook.eu';

function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}

const wrap = 'font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;line-height:1.6';

function section(title: string, count: number, rows: string[]): string {
  const body = rows.length
    ? `<ul style="margin:0 0 4px;padding-left:18px">${rows.map((r) => `<li style="margin:2px 0">${r}</li>`).join('')}</ul>`
    : `<p style="margin:0;color:#777">None.</p>`;
  return `<h2 style="font-size:15px;margin:22px 0 8px;color:#0A1D2B">${esc(title)} <span style="color:#777;font-weight:normal">(${count})</span></h2>${body}`;
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ message: 'CRON_SECRET is not set' }, { status: 500 });
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const since = new Date(now.getTime() - 24 * 3_600_000);
  const sinceIso = since.toISOString();

  const [usersRes, profilesRes, regsRes, subsRes, activeCountRes] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('profiles').select('user_id, first_name, last_name, email, email_opt_in, created_at'),
    admin
      .from('event_registrations')
      .select('user_id, event_slug, event_title, created_at')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false }),
    admin
      .from('subscriptions')
      .select('user_id, source, tier, billing_interval, status, created_at')
      .gte('created_at', sinceIso),
    admin.from('subscriptions').select('*', { count: 'exact', head: true }).in('status', ['active', 'trialing']),
  ]);

  const allUsers = usersRes.data?.users ?? [];
  const emailBy = new Map(allUsers.map((u) => [u.id, u.email ?? '']));
  const metaBy = new Map(
    allUsers.map((u) => [u.id, (u.user_metadata ?? {}) as { first_name?: string; last_name?: string }])
  );
  const profileBy = new Map((profilesRes.data ?? []).map((p) => [p.user_id, p]));
  const nameOf = (uid: string) => {
    const p = profileBy.get(uid);
    const m = metaBy.get(uid);
    const name = `${p?.first_name ?? m?.first_name ?? ''} ${p?.last_name ?? m?.last_name ?? ''}`.trim();
    return name || emailBy.get(uid) || 'Unknown';
  };
  const emailOf = (uid: string) => profileBy.get(uid)?.email || emailBy.get(uid) || '';

  const newUsers = allUsers.filter((u) => u.created_at && new Date(u.created_at) >= since);
  const newProfiles = (profilesRes.data ?? []).filter((p) => p.created_at && new Date(p.created_at) >= since);
  const newOptIns = newProfiles.filter((p) => p.email_opt_in);
  const regs = regsRes.data ?? [];
  const subs = subsRes.data ?? [];

  // Skip empty days — don't send a digest when nothing happened.
  if (newUsers.length === 0 && regs.length === 0 && subs.length === 0 && newOptIns.length === 0) {
    return NextResponse.json({ ok: true, sent: false, skipped: 'no activity in the last 24 hours' });
  }

  const accountRows = newUsers.map((u) => {
    const done = profileBy.has(u.id) ? '' : ' <span style="color:#999">(profile not completed)</span>';
    return `${esc(nameOf(u.id))} &lt;${esc(u.email)}&gt;${done}`;
  });
  const regRows = regs.map(
    (r) => `${esc(nameOf(r.user_id))} → <strong>${esc(r.event_title || r.event_slug)}</strong>`
  );
  const memberRows = subs.map((s) => {
    const plan = s.tier ? TIER_LABELS[s.tier as Tier] ?? s.tier : 'Member';
    const interval = s.billing_interval === 'year' ? 'Annual' : s.billing_interval === 'month' ? 'Monthly' : '';
    return `${esc(nameOf(s.user_id))} — ${esc(plan)}${interval ? ` · ${interval}` : ''} <span style="color:#999">(${esc(s.source || 'new')})</span>`;
  });
  const optInRows = newOptIns.map((p) => `${esc(nameOf(p.user_id))} &lt;${esc(emailOf(p.user_id))}&gt;`);

  const dateLabel = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Brussels',
  });

  const html = `
    <div style="${wrap};max-width:600px;margin:0 auto">
      <p style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#777;margin:0 0 2px">european campaign playbook</p>
      <h1 style="font-size:20px;margin:0 0 2px">Daily activity</h1>
      <p style="color:#777;margin:0 0 18px">${esc(dateLabel)} · last 24 hours</p>
      <div style="background:#F3EFE6;border-radius:2px;padding:12px 16px;margin:0 0 8px;font-size:14px">
        <strong>${newUsers.length}</strong> new account${newUsers.length === 1 ? '' : 's'} ·
        <strong>${regs.length}</strong> event sign-up${regs.length === 1 ? '' : 's'} ·
        <strong>${subs.length}</strong> new member${subs.length === 1 ? '' : 's'} ·
        <strong>${newOptIns.length}</strong> newsletter opt-in${newOptIns.length === 1 ? '' : 's'}
      </div>
      ${section('New accounts', newUsers.length, accountRows)}
      ${section('Event sign-ups', regs.length, regRows)}
      ${section('New members', subs.length, memberRows)}
      ${section('Newsletter opt-ins', newOptIns.length, optInRows)}
      <hr style="border:none;border-top:1px solid #E3DDD0;margin:22px 0 10px" />
      <p style="color:#777;font-size:13px;margin:0">
        Totals: <strong>${allUsers.length}</strong> accounts · <strong>${activeCountRes.count ?? 0}</strong> active members.
      </p>
      <p style="color:#999;font-size:12px;margin:10px 0 0">
        <a href="https://www.campaignplaybook.eu/admin" style="color:#154DA5">Open the admin dashboard →</a>
      </p>
    </div>`;

  const subject = `Daily activity — ${newUsers.length} new, ${regs.length} sign-up${regs.length === 1 ? '' : 's'}`;
  const sent = await sendAdminEmail(DIGEST_TO, subject, html);

  return NextResponse.json({
    ok: true,
    sent,
    to: DIGEST_TO,
    counts: {
      newAccounts: newUsers.length,
      newRegistrations: regs.length,
      newMembers: subs.length,
      newOptIns: newOptIns.length,
    },
  });
}
