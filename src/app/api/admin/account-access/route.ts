import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { deliverAccountAccess } from '@/lib/confirmation-reminder';
import { ADMIN_EMAIL } from '@/lib/admin';

// Sends the "your account is ready" email, with a working sign-in link, to
// people who have an account and have never opened it.
//
//   POST { preview: true }            one copy to the admin, to read first
//   POST { emails: [...] }            the real thing, at most 50 at a time
//
// The signup date comes from the account itself, so the email can say when,
// and an address with no account is refused rather than guessed at.
function authorised(request: NextRequest): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return false;
  const given = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${key}`);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

async function usersByEmail(): Promise<Map<string, { created_at: string }>> {
  const admin = createAdminClient();
  const map = new Map<string, { created_at: string }>();
  for (let page = 1; page <= 10; page += 1) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    for (const u of data?.users ?? []) {
      if (u.email) map.set(u.email.toLowerCase(), { created_at: u.created_at });
    }
    if ((data?.users ?? []).length < 1000) break;
  }
  return map;
}

export async function POST(request: NextRequest) {
  if (!authorised(request)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { preview?: boolean; emails?: string[] };
  const users = await usersByEmail();

  if (body.preview) {
    const me = users.get(ADMIN_EMAIL);
    const result = await deliverAccountAccess({
      email: ADMIN_EMAIL,
      signedUpAt: me?.created_at ?? new Date().toISOString(),
    });
    return NextResponse.json({ preview: true, to: ADMIN_EMAIL, ...result });
  }

  const emails = (body.emails ?? []).map((e) => e.trim().toLowerCase()).filter(Boolean).slice(0, 50);
  if (emails.length === 0) return NextResponse.json({ message: 'No addresses given' }, { status: 400 });

  const results: { email: string; ok: boolean; error?: string }[] = [];
  for (const email of emails) {
    const user = users.get(email);
    if (!user) {
      results.push({ email, ok: false, error: 'no account for that address' });
      continue;
    }
    const sent = await deliverAccountAccess({ email, signedUpAt: user.created_at });
    results.push({ email, ok: sent.ok, ...(sent.ok ? {} : { error: sent.error }) });
  }

  return NextResponse.json({ sent: results.filter((r) => r.ok).length, of: results.length, results });
}
