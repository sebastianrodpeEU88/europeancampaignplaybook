import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { beehiivCustomFields } from '@/lib/integrations/beehiiv';
import {
  inventory,
  importFromNotion,
  importFromBeehiiv,
  stripeInventory,
  legacyStripeInventory,
  reconcileLegacyStripe,
  applyLegacyRenewalDates,
} from '@/lib/crm/align';
import { createAdminClient } from '@/lib/supabase/admin';

// Lining the systems up, for an operator holding the service-role key.
//
//   GET                                what each system holds, and what is missing
//   POST { action: 'import-notion' }   bring Notion-only people into contacts
//   POST { action: 'import-beehiiv' }  bring the newsletter audience in too
//   POST { action: 'requeue' }         queue every active contact for a push
function authorised(request: NextRequest): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return false;
  const given = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${key}`);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

export async function GET(request: NextRequest) {
  if (!authorised(request)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const probe = request.nextUrl.searchParams.get('probe');
  if (probe === 'stripe') {
    return NextResponse.json({ stripe: await stripeInventory() });
  }
  if (probe === 'stripe-legacy') {
    return NextResponse.json({ legacyStripe: await legacyStripeInventory() });
  }
  if (probe === 'beehiiv-fields') {
    return NextResponse.json(await beehiivCustomFields());
  }
  if (probe === 'stripe-legacy-reconcile') {
    return NextResponse.json(await reconcileLegacyStripe());
  }
  return NextResponse.json(await inventory());
}

export async function POST(request: NextRequest) {
  if (!authorised(request)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { action?: string; apply?: boolean; limit?: number };

  if (body.action === 'import-notion') {
    return NextResponse.json(await importFromNotion(Boolean(body.apply), Math.min(body.limit ?? 250, 400)));
  }

  if (body.action === 'legacy-renewal-dates') {
    return NextResponse.json(await applyLegacyRenewalDates(Boolean(body.apply)));
  }

  if (body.action === 'import-beehiiv') {
    return NextResponse.json(await importFromBeehiiv(Boolean(body.apply), Math.min(body.limit ?? 250, 400)));
  }

  // Every active contact goes back in the queue, so the next drain pushes the
  // whole list to the channels with its consent basis attached.
  if (body.action === 'requeue') {
    const admin = createAdminClient();
    // PostgREST stops at 1,000 rows, and the list is twice that, so page
    // through it. Without this the second half never reaches the channels.
    const all: { id: string }[] = [];
    for (let from = 0; ; from += 1000) {
      const { data: page } = await admin
        .from('contacts')
        .select('id')
        .eq('status', 'active')
        .order('id')
        .range(from, from + 999);
      all.push(...((page ?? []) as { id: string }[]));
      if (!page || page.length < 1000) break;
    }
    const data = all;
    let queued = 0;
    for (const row of data ?? []) {
      const { data: pending } = await admin
        .from('contact_sync_queue')
        .select('id')
        .eq('contact_id', row.id)
        .is('synced_at', null)
        .maybeSingle();
      if (pending) continue;
      const { error } = await admin.from('contact_sync_queue').insert({ contact_id: row.id, reason: 'align' });
      if (!error) queued += 1;
    }
    return NextResponse.json({ queued, of: (data ?? []).length });
  }

  return NextResponse.json({ message: 'Unknown action' }, { status: 400 });
}
