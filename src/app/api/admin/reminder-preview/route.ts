import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_EMAIL } from '@/lib/admin';
import { deliverConfirmationReminder } from '@/lib/confirmation-reminder';

// Server-to-server twin of the admin panel's "Send me a preview": emails the
// final signup reminder, dated `signedUpOn` (YYYY-MM-DD), to the admin inbox
// and nowhere else. Authorised with the service-role key, which only the
// server and its operators hold.
export async function POST(request: NextRequest) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const given = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${key}`);
  if (!key || given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { signedUpOn?: string };
  const day = /^\d{4}-\d{2}-\d{2}$/.test(body.signedUpOn ?? '') ? body.signedUpOn : null;
  // Midday UTC keeps the date the same once it is shown in Brussels time.
  const signedUpAt = day ? `${day}T12:00:00Z` : new Date().toISOString();

  const result = await deliverConfirmationReminder({ email: ADMIN_EMAIL, signedUpAt });
  return result.ok
    ? NextResponse.json({ sent: true, to: ADMIN_EMAIL, signedUpAt })
    : NextResponse.json({ sent: false, error: result.error }, { status: 502 });
}
