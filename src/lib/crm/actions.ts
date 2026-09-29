'use server';

import { after } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminEmail } from '@/lib/admin';
import { drainContactSyncQueue } from '@/lib/crm/sync';
import { STAGES, SOURCES, CLIENT_TYPES } from '@/lib/crm/funnel';

// What an admin changes by hand: the stage, where somebody came from, what
// kind of client they are, and the notes. Everything else about a contact is
// computed from the site's own tables and would be overwritten anyway.
//
// Each change queues a push to the channels through the same outbox as
// everything else, and drains it straight away.

async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) throw new Error('not authorised');
  return user!.email!;
}

export async function setContactStage(contactId: string, stage: string, note?: string): Promise<void> {
  const actor = await requireAdmin();
  if (!STAGES.some((s) => s.value === stage)) throw new Error('unknown stage');

  const admin = createAdminClient();
  await admin
    .from('contacts')
    .update({ stage, stage_actor: actor, stage_note: note?.trim() || null })
    .eq('id', contactId);

  after(() => drainContactSyncQueue(5));
  revalidatePath('/admin');
}

export async function setContactField(
  contactId: string,
  field: 'acquisition_source' | 'client_type' | 'status',
  value: string | null
): Promise<void> {
  await requireAdmin();

  const allowed: Record<string, readonly string[]> = {
    acquisition_source: SOURCES.map((s) => s.value),
    client_type: CLIENT_TYPES.map((s) => s.value),
    status: ['active', 'junk'],
  };
  if (value !== null && !allowed[field].includes(value)) throw new Error('unknown value');

  const admin = createAdminClient();
  await admin.from('contacts').update({ [field]: value }).eq('id', contactId);

  after(() => drainContactSyncQueue(5));
  revalidatePath('/admin');
}

export async function addContactNote(contactId: string, body: string): Promise<void> {
  const author = await requireAdmin();
  const text = body.trim();
  if (!text) return;

  const admin = createAdminClient();
  await admin.from('contact_notes').insert({ contact_id: contactId, body: text, author });
  revalidatePath('/admin');
}
