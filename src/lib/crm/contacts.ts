import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { sourceFromAttribution, type Attribution } from '@/lib/crm/attribution';

// The contacts table is the master person record: one row per human, keyed on
// the normalised email address (see supabase/schema.sql). Everything that
// learns about a person comes through here, and a database trigger queues the
// push to Notion and beehiiv, so no caller has to remember to sync.
//
// Accounts look after themselves: writes to profiles, subscriptions,
// event_registrations and bootcamp_progress refresh their contact through
// triggers. These helpers are for the people who have no account yet — form
// leads, workshop attendees, newsletter-only readers — and for nudging the
// worker after a change so the channels update within seconds.

export type Contact = {
  id: string;
  email: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  career_stage: string | null;
  organisation_type: string | null;
  company: string | null;
  membership_tier: string | null;
  membership_plan: string | null;
  membership_source: string | null;
  membership_status: string | null;
  member_since: string | null;
  newsletter_opt_in: boolean;
  newsletter_status: string;
  events_registered: number;
  info_sessions_registered: number;
  info_sessions_attended: number;
  info_session_no_shows: number;
  workshops_registered: number;
  workshops_attended: number;
  workshop_no_shows: number;
  free_workshop_used_at: string | null;
  free_workshop_event: string | null;
  last_event_slug: string | null;
  last_event_at: string | null;
  bootcamp_days_done: number;
  status: 'active' | 'junk';
  stage: string;
  stage_changed_at: string | null;
  acquisition_source: string | null;
  client_type: string | null;
  source: string | null;
  sources: string[];
  notion_page_id: string | null;
  beehiiv_subscription_id: string | null;
  last_synced_at: string | null;
};

export type ContactPatch = Partial<
  Pick<
    Contact,
    | 'first_name'
    | 'last_name'
    | 'phone'
    | 'career_stage'
    | 'organisation_type'
    | 'company'
    | 'newsletter_opt_in'
    | 'newsletter_status'
  >
>;

// Create or update a person by email. Returns the contact id, or null when the
// address is unusable or the table is not there yet (the schema is applied by
// hand in the Supabase SQL editor, so the site has to survive its absence).
export async function upsertContact(input: {
  email: string;
  source?: string;
  patch?: ContactPatch;
  userId?: string | null;
}): Promise<string | null> {
  const email = input.email?.trim();
  if (!email) return null;

  const admin = createAdminClient();

  const { data, error } = await admin.rpc('upsert_contact', {
    p_email: email,
    p_user_id: input.userId ?? null,
    p_source: input.source ?? null,
  });

  if (error) {
    console.error('upsertContact failed:', error.message);
    return null;
  }

  const contactId = data as string | null;
  if (!contactId) return null;

  // Only overwrite what the caller actually knows: a blank field from a short
  // form should never wipe something a fuller one supplied earlier.
  const patch = Object.fromEntries(
    Object.entries(input.patch ?? {}).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  if (Object.keys(patch).length > 0) {
    const { error: patchError } = await admin.from('contacts').update(patch).eq('id', contactId);
    if (patchError) console.error('upsertContact patch failed:', patchError.message);
  }

  return contactId;
}

// Recompute one account's contact from the tables that hold the truth. The
// triggers call this too; it is exported for the paths that want the contact
// correct before they hand off to the worker.
export async function refreshContactForUser(userId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc('refresh_contact_for_user', { p_user_id: userId });
  if (error) console.error('refreshContactForUser failed:', error.message);
}

// Fill in where somebody came from, once their account exists. First touch
// wins: a source already on the contact is left alone, whether a human set it
// or an earlier signup did.
export async function applyAttribution(
  userId: string,
  metadata: Record<string, unknown> | undefined
): Promise<void> {
  const attribution = (metadata?.attribution ?? null) as Attribution | null;
  const source = sourceFromAttribution(attribution);
  if (!source) return;

  const admin = createAdminClient();
  const { data } = await admin
    .from('contacts')
    .select('id, acquisition_source')
    .eq('user_id', userId)
    .maybeSingle();
  if (!data || data.acquisition_source) return;

  const { error } = await admin
    .from('contacts')
    .update({ acquisition_source: source })
    .eq('id', data.id);
  if (error) console.error('applyAttribution failed:', error.message);
}

// Fill an empty source on a contact that has no account behind it yet.
export async function setAcquisitionIfEmpty(contactId: string, source: string): Promise<void> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('contacts')
    .select('acquisition_source')
    .eq('id', contactId)
    .maybeSingle();
  if (!data || data.acquisition_source) return;
  await admin.from('contacts').update({ acquisition_source: source }).eq('id', contactId);
}

// What the channels are told about a person, in one read.
export async function getContact(contactId: string): Promise<Contact | null> {
  const admin = createAdminClient();
  const { data } = await admin.from('contacts').select('*').eq('id', contactId).maybeSingle();
  return (data as Contact) ?? null;
}
