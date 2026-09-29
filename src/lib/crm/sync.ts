import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncContactPage } from '@/lib/integrations/notion';
import { syncBeehiivSubscriber } from '@/lib/integrations/beehiiv';
import { CAREER_STAGES, ORGANISATION_TYPES, labelFor } from '@/lib/profile';
import { STAGE_LABELS, SOURCE_LABELS, CLIENT_TYPE_LABELS } from '@/lib/crm/funnel';
import { consentBasis, shouldMirrorToNotion } from '@/lib/crm/align';
import type { Contact } from '@/lib/crm/contacts';

// The worker behind the contact outbox.
//
// A trigger queues one row per changed contact (supabase/schema.sql). This
// drains the queue: for each contact it pushes the whole current state to
// Notion and to beehiiv, writes back the page id and the subscription id, and
// marks the row synced. Failures stay queued with the error recorded, so the
// next run retries them and the admin health check can show what is stuck.
//
// Idempotent by construction: pushing the same state twice changes nothing.

const MAX_ATTEMPTS = 5;

export type SyncSummary = {
  ok: boolean;
  processed: number;
  synced: number;
  failed: number;
  skipped: number;
  errors: { email: string; error: string }[];
};

type QueueRow = { id: number; contact_id: string; attempts: number };

export async function drainContactSyncQueue(limit = 25): Promise<SyncSummary> {
  const summary: SyncSummary = { ok: true, processed: 0, synced: 0, failed: 0, skipped: 0, errors: [] };
  const admin = createAdminClient();

  const { data: queue, error } = await admin
    .from('contact_sync_queue')
    .select('id, contact_id, attempts')
    .is('synced_at', null)
    .lt('attempts', MAX_ATTEMPTS)
    .order('enqueued_at', { ascending: true })
    .limit(limit);

  if (error) {
    // The table only exists once the schema has been applied; say so quietly
    // rather than failing the caller that nudged the worker.
    return { ...summary, ok: false, errors: [{ email: '-', error: error.message }] };
  }

  for (const row of (queue ?? []) as QueueRow[]) {
    summary.processed += 1;

    const { data: contact } = await admin
      .from('contacts')
      .select('*')
      .eq('id', row.contact_id)
      .maybeSingle();

    // A contact that is gone, or one set aside as junk, closes its queue row
    // without troubling the channels. Flip the status back to active and the
    // next change queues it again like anyone else.
    if (!contact || (contact as Contact).status === 'junk') {
      await admin.from('contact_sync_queue').update({ synced_at: new Date().toISOString() }).eq('id', row.id);
      summary.skipped += 1;
      continue;
    }

    const c = contact as Contact;
    const problems: string[] = [];
    const stamp: Record<string, string | null> = {};
    // A channel with no credentials is skipped rather than failed, but it does
    // not count as delivered either: a contact is only done once something
    // actually took the update.
    let pushed = 0;
    let unconfigured = 0;

    // ── Notion: the mirror people work in ──────────────────────────────────
    // Only the people worth working: see shouldMirrorToNotion.
    const notion = shouldMirrorToNotion(c) ? await syncContactPage(
      {
        email: c.email,
        firstName: c.first_name,
        lastName: c.last_name,
        phone: c.phone,
        careerStage: labelFor(CAREER_STAGES, c.career_stage),
        organisationType: labelFor(ORGANISATION_TYPES, c.organisation_type),
        company: c.company,
        newsletterOptIn: c.newsletter_opt_in,
        membershipTier: c.membership_tier,
        membershipPlan: c.membership_plan,
        membershipSource: c.membership_source,
        membershipStatus: c.membership_status,
        memberSince: c.member_since,
        eventsRegistered: c.events_registered,
        lastEvent: c.last_event_slug,
        lastEventAt: c.last_event_at,
        bootcampDays: c.bootcamp_days_done,
        source: c.source,
        stage: STAGE_LABELS[c.stage] ?? c.stage,
        infoSessions: `${c.info_sessions_attended} of ${c.info_sessions_registered} attended`,
        workshops: `${c.workshops_attended} of ${c.workshops_registered} attended`,
        freeWorkshopUsed: Boolean(c.free_workshop_used_at),
        acquisitionSource: c.acquisition_source ? SOURCE_LABELS[c.acquisition_source] : null,
        clientType: c.client_type ? CLIENT_TYPE_LABELS[c.client_type] : null,
      },
      c.notion_page_id
    ) : { ok: true as const };
    if (notion.ok) {
      pushed += 1;
      if (notion.pageId && notion.pageId !== c.notion_page_id) stamp.notion_page_id = notion.pageId;
    } else if (notion.error === 'notion-not-configured') {
      unconfigured += 1;
    } else {
      problems.push(`notion: ${notion.error}`);
    }

    // ── beehiiv: the channel, for everyone it can lawfully reach ───────────
    //
    // Every active contact belongs on the list, so one send can reach the
    // whole audience. What differs is the basis: an explicit newsletter
    // opt-in, a paying member, an account holder, or a contact we hold with
    // no account. That basis travels as a field, so a marketing send can be
    // segmented to the people who asked for one.
    //
    // Two lines are never crossed: somebody who unsubscribed or bounced in
    // beehiiv stays that way, and junk never reaches the channel at all.
    const wantsEmail = c.newsletter_status !== 'unsubscribed' && c.newsletter_status !== 'bounced';
    if (wantsEmail) {
      const beehiiv = await syncBeehiivSubscriber({
        email: c.email,
        knownSubscriptionId: c.beehiiv_subscription_id,
        fields: {
          membership_tier: c.membership_tier ?? c.membership_plan,
          membership_status: c.membership_status,
          events_registered: c.events_registered,
          bootcamp_days: c.bootcamp_days_done,
          last_event: c.last_event_slug,
          consent: consentBasis(c),
        },
      });
      if (beehiiv.ok) {
        pushed += 1;
        if (beehiiv.subscriptionId && beehiiv.subscriptionId !== c.beehiiv_subscription_id) {
          stamp.beehiiv_subscription_id = beehiiv.subscriptionId;
        }
        // beehiiv is where someone actually unsubscribes, so its answer is the
        // one the master record keeps.
        if (beehiiv.status && beehiiv.status !== c.newsletter_status) {
          stamp.newsletter_status = beehiiv.status;
        }
        if (beehiiv.warning) problems.push(`beehiiv: ${beehiiv.warning}`);
      } else if (beehiiv.error === 'beehiiv-not-configured') {
        unconfigured += 1;
      } else {
        problems.push(`beehiiv: ${beehiiv.error}`);
      }
    }

    // Bookkeeping columns are excluded from the enqueue trigger, so writing
    // them here does not queue the contact all over again.
    stamp.last_synced_at = new Date().toISOString();
    await admin.from('contacts').update(stamp).eq('id', c.id);

    if (pushed === 0 && unconfigured > 0) {
      problems.push('no channel configured in this environment');
    }

    if (problems.length === 0) {
      await admin
        .from('contact_sync_queue')
        .update({ synced_at: new Date().toISOString(), attempts: row.attempts + 1, last_error: null })
        .eq('id', row.id);
      summary.synced += 1;
    } else {
      await admin
        .from('contact_sync_queue')
        .update({ attempts: row.attempts + 1, last_error: problems.join(' | ').slice(0, 500) })
        .eq('id', row.id);
      summary.failed += 1;
      summary.ok = false;
      summary.errors.push({ email: c.email, error: problems.join(' | ') });
    }
  }

  return summary;
}

// How the queue is doing, for the admin health check.
export async function contactSyncStatus(): Promise<{
  pending: number;
  stuck: number;
  oldestPending: string | null;
  lastErrors: { email: string | null; error: string | null }[];
}> {
  const admin = createAdminClient();

  const [{ count: pending }, { count: stuck }, { data: oldest }, { data: failing }] = await Promise.all([
    admin.from('contact_sync_queue').select('id', { count: 'exact', head: true }).is('synced_at', null),
    admin
      .from('contact_sync_queue')
      .select('id', { count: 'exact', head: true })
      .is('synced_at', null)
      .gte('attempts', MAX_ATTEMPTS),
    admin
      .from('contact_sync_queue')
      .select('enqueued_at')
      .is('synced_at', null)
      .order('enqueued_at', { ascending: true })
      .limit(1),
    admin
      .from('contact_sync_queue')
      .select('last_error, contacts(email)')
      .is('synced_at', null)
      .not('last_error', 'is', null)
      .order('enqueued_at', { ascending: true })
      .limit(5),
  ]);

  return {
    pending: pending ?? 0,
    stuck: stuck ?? 0,
    oldestPending: oldest?.[0]?.enqueued_at ?? null,
    lastErrors: (failing ?? []).map((r) => {
      const row = r as { last_error: string | null; contacts?: { email?: string } | { email?: string }[] | null };
      const joined = Array.isArray(row.contacts) ? row.contacts[0] : row.contacts;
      return { email: joined?.email ?? null, error: row.last_error };
    }),
  };
}
