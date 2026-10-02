import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { beehiivCustomFields, beehiivSample } from '@/lib/integrations/beehiiv';
import { archiveNotionPages } from '@/lib/integrations/notion';
import {
  inventory,
  importFromNotion,
  importFromBeehiiv,
  stripeInventory,
  legacyStripeInventory,
  reconcileLegacyStripe,
  applyLegacyRenewalDates,
  importNotionExtras,
  pruneNotionStatus,
  importBeehiivEngagement,
  stripeSearch,
  reconcileLiveStripe,
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
  if (probe === 'stripe-search') {
    const email = request.nextUrl.searchParams.get('email');
    if (!email) return NextResponse.json({ message: 'email required' }, { status: 400 });
    return NextResponse.json(await stripeSearch(email));
  }
  if (probe === 'stripe-legacy') {
    return NextResponse.json({ legacyStripe: await legacyStripeInventory() });
  }
  if (probe === 'beehiiv-sample') {
    return NextResponse.json(await beehiivSample());
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
  const body = (await request.json().catch(() => ({}))) as { action?: string; apply?: boolean; limit?: number; pageIds?: unknown[]; status?: string };

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

    // Paged, because PostgREST stops at 1,000 rows and the list is twice
    // that. Done as three bulk steps rather than a round trip per contact:
    // the per-contact version ran 4,000 requests and timed out the function
    // half way through.
    const active: { id: string }[] = [];
    for (let from = 0; ; from += 1000) {
      const { data } = await admin
        .from('contacts')
        .select('id')
        .eq('status', 'active')
        .order('id')
        .range(from, from + 999);
      active.push(...((data ?? []) as { id: string }[]));
      if (!data || data.length < 1000) break;
    }

    const queued = new Set<string>();
    for (let from = 0; ; from += 1000) {
      const { data } = await admin
        .from('contact_sync_queue')
        .select('contact_id')
        .is('synced_at', null)
        .order('contact_id')
        .range(from, from + 999);
      for (const r of (data ?? []) as { contact_id: string }[]) queued.add(r.contact_id);
      if (!data || data.length < 1000) break;
    }

    const rows = active
      .filter((c) => !queued.has(c.id))
      .map((c) => ({ contact_id: c.id, reason: 'align' }));

    let inserted = 0;
    for (let i = 0; i < rows.length; i += 500) {
      const { error, count } = await admin
        .from('contact_sync_queue')
        .insert(rows.slice(i, i + 500), { count: 'exact' });
      if (!error) inserted += count ?? rows.slice(i, i + 500).length;
    }

    return NextResponse.json({ queued: inserted, alreadyQueued: queued.size, of: active.length });
  }

  // Copy the Notion-only fields onto the matching contacts. Dry by default:
  // pass apply to write. Optionally narrowed to one AUTOMATION - Status.
  if (body.action === 'import-notion-extras') {
    return NextResponse.json(
      await importNotionExtras(Boolean(body.apply), typeof body.status === 'string' ? body.status : undefined)
    );
  }

  // Pull per-subscriber engagement from beehiiv onto the contacts.
  // Write the membership rows the Stripe webhook never wrote.
  if (body.action === 'reconcile-live-stripe') {
    return NextResponse.json(await reconcileLiveStripe(Boolean(body.apply)));
  }

  if (body.action === 'import-engagement') {
    return NextResponse.json(await importBeehiivEngagement(Boolean(body.apply)));
  }

  // Wind a whole Notion status down: migrate each row's fields, then trash
  // the page, and only for rows whose contact exists. Dry without apply.
  if (body.action === 'notion-prune') {
    if (typeof body.status !== 'string' || !body.status) {
      return NextResponse.json({ message: 'status required' }, { status: 400 });
    }
    return NextResponse.json(await pruneNotionStatus(body.status, Boolean(body.apply)));
  }

  // Send named Notion pages to the trash. Ids are passed in by the operator
  // rather than worked out here, so a mistake in a query cannot turn into a
  // deletion on its own.
  if (body.action === 'notion-archive') {
    const ids = Array.isArray(body.pageIds) ? body.pageIds.filter((v) => typeof v === 'string') : [];
    if (!ids.length) return NextResponse.json({ message: 'pageIds required' }, { status: 400 });
    if (ids.length > 250) return NextResponse.json({ message: 'at most 250 at a time' }, { status: 400 });
    const result = await archiveNotionPages(ids);
    return NextResponse.json({ requested: ids.length, archived: result.archived.length, failed: result.failed });
  }

  return NextResponse.json({ message: 'Unknown action' }, { status: 400 });
}
