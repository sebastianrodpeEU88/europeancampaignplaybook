import { NextResponse, type NextRequest } from 'next/server';
import { drainContactSyncQueue, contactSyncStatus } from '@/lib/crm/sync';

// Drains the contact outbox: every person whose record changed since the last
// run is pushed to Notion and beehiiv. Safe to call as often as you like, and
// safe to miss — the queue keeps the work until someone takes it.
//
// Called three ways, deliberately:
//   1. after a write, from the action that made it (near-instant)
//   2. by the daily summary cron, as a sweep for anything that failed
//   3. here, for a schedule of its own (Vercel cron, or any pinger) with
//      Authorization: Bearer ${CRON_SECRET}
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ message: 'CRON_SECRET is not set' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') || '100'), 250);
  const result = await drainContactSyncQueue(limit);
  const status = await contactSyncStatus();

  return NextResponse.json({ ...result, queue: status });
}
