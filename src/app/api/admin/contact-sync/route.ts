import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { drainContactSyncQueue, contactSyncStatus } from '@/lib/crm/sync';

// Operator handle on the contact outbox, in the same shape as the other admin
// routes: authorised with the service-role key, which only the server and its
// operators hold. Drains a batch on POST, reports the queue on GET.
//
// The queue drains by itself after every write and again on the daily cron;
// this is for the first run of a batch, and for pushing a fix through without
// waiting.
function authorised(request: NextRequest): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return false;
  const given = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${key}`);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

export async function GET(request: NextRequest) {
  if (!authorised(request)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ queue: await contactSyncStatus() });
}

export async function POST(request: NextRequest) {
  if (!authorised(request)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { limit?: number };
  const limit = Math.min(Math.max(Number(body.limit) || 25, 1), 250);

  const result = await drainContactSyncQueue(limit);
  return NextResponse.json({ ...result, queue: await contactSyncStatus() });
}
