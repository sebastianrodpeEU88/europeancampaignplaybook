import 'server-only';

// Beehiiv newsletter subscription via the v2 REST API (no SDK).
const BEEHIIV_API = 'https://api.beehiiv.com/v2';

export type BeehiivResult = { ok: boolean; error?: string };

// Subscribe an email to the publication. Idempotent: reactivate_existing means
// re-subscribing an existing address succeeds rather than erroring. Pass
// `doubleOptIn` for public signups (e.g. the newsletter form) so Beehiiv sends
// a confirmation email and the subscriber stays "pending" until they click it —
// the GDPR-friendly consent flow.
export async function subscribeToBeehiiv(input: {
  email: string;
  doubleOptIn?: boolean;
}): Promise<BeehiivResult> {
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  const key = process.env.BEEHIIV_API_KEY;
  if (!pubId || !key) return { ok: false, error: 'beehiiv-not-configured' };

  try {
    const res = await fetch(`${BEEHIIV_API}/publications/${pubId}/subscriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email,
        reactivate_existing: true,
        send_welcome_email: false,
        // Force the confirmation (double opt-in) email for public signups.
        ...(input.doubleOptIn ? { double_opt_override: 'on' } : {}),
        utm_source: 'europeancampaignplaybook.eu',
        utm_medium: 'website-signup',
      }),
    });
    if (!res.ok) return { ok: false, error: `${res.status}: ${(await res.text()).slice(0, 200)}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ── Subscriber sync ─────────────────────────────────────────────────────────
// The worker pushes the whole picture of a contact: the subscription itself,
// plus the fields the newsletter segments on. beehiiv discards custom fields it
// does not know, so the publication's fields are created once, on first use.

export type BeehiivFields = {
  membership_tier?: string | null;
  membership_status?: string | null;
  events_registered?: number | null;
  bootcamp_days?: number | null;
  last_event?: string | null;
  // Why this address is on the list: newsletter, member, account or contact.
  // Segment on this before sending anything that counts as marketing.
  consent?: string | null;
  // Where they are in the renewal cycle, so a reminder can be segmented.
  renewal?: string | null;
  // Where they sit in the funnel, as the label the admin panel shows. This is
  // what lets a send go to Leads alone, or to the dormant pile, without
  // touching anybody's stage.
  stage?: string | null;
  // Which campaign or channel brought them in, for measuring what an advert
  // actually bought.
  acquisition_source?: string | null;
};

export type BeehiivSyncResult = {
  ok: boolean;
  subscriptionId?: string;
  // What beehiiv says about this address, so the master record can hold the
  // truth about consent rather than guessing at it.
  status?: 'pending' | 'subscribed' | 'unsubscribed' | 'bounced';
  warning?: string;
  error?: string;
};

const FIELD_KINDS: Record<keyof BeehiivFields, 'string' | 'integer'> = {
  membership_tier: 'string',
  membership_status: 'string',
  events_registered: 'integer',
  bootcamp_days: 'integer',
  last_event: 'string',
  consent: 'string',
  renewal: 'string',
  stage: 'string',
  acquisition_source: 'string',
};

let fieldsEnsuredAt = 0;

// Create any missing custom field on the publication. Cached for an hour: the
// answer changes about once in the life of the integration.
async function ensureCustomFields(pubId: string, key: string): Promise<void> {
  if (Date.now() - fieldsEnsuredAt < 60 * 60 * 1000) return;

  const res = await fetch(`${BEEHIIV_API}/publications/${pubId}/custom_fields?limit=100`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) return;
  const body = (await res.json()) as { data?: { display?: string }[] };
  const existing = new Set((body.data ?? []).map((f) => f.display));

  for (const [display, kind] of Object.entries(FIELD_KINDS)) {
    if (existing.has(display)) continue;
    await fetch(`${BEEHIIV_API}/publications/${pubId}/custom_fields`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, display }),
    });
  }
  fieldsEnsuredAt = Date.now();
}

// What beehiiv currently thinks of an address, mapped onto the words the
// contacts table uses. A 404 means they have never subscribed.
export type BeehiivState = {
  found: boolean;
  id?: string;
  status?: 'pending' | 'subscribed' | 'unsubscribed' | 'bounced';
  error?: string;
};

function mapStatus(status?: string): BeehiivState['status'] {
  switch (status) {
    case 'active':
      return 'subscribed';
    case 'validating':
    case 'pending':
      return 'pending';
    case 'inactive':
    case 'paused':
      return 'unsubscribed';
    case 'invalid':
    case 'needs_attention':
      return 'bounced';
    default:
      return undefined;
  }
}

export async function getBeehiivSubscriber(email: string): Promise<BeehiivState> {
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  const key = process.env.BEEHIIV_API_KEY;
  if (!pubId || !key) return { found: false, error: 'beehiiv-not-configured' };

  try {
    const res = await fetch(
      `${BEEHIIV_API}/publications/${pubId}/subscriptions/by_email/${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${key}` } }
    );
    if (res.status === 404) return { found: false };
    if (!res.ok) return { found: false, error: `${res.status}: ${(await res.text()).slice(0, 200)}` };
    const body = (await res.json()) as { data?: { id?: string; status?: string } };
    return { found: true, id: body.data?.id, status: mapStatus(body.data?.status) };
  } catch (e) {
    return { found: false, error: (e as Error).message };
  }
}

// Set a contact's fields on beehiiv, and subscribe the address when beehiiv has
// never seen it. Someone who unsubscribed in beehiiv stays unsubscribed: their
// state is read back instead, so consent lives in one place and the CRM learns
// what the channel already knows.
export async function syncBeehiivSubscriber(input: {
  email: string;
  fields: BeehiivFields;
  knownSubscriptionId?: string | null;
}): Promise<BeehiivSyncResult> {
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  const key = process.env.BEEHIIV_API_KEY;
  if (!pubId || !key) return { ok: false, error: 'beehiiv-not-configured' };

  const custom_fields = Object.entries(input.fields)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([name, value]) => ({ name, value }));

  try {
    await ensureCustomFields(pubId, key);

    const existing = await getBeehiivSubscriber(input.email);
    if (existing.error && existing.error !== 'beehiiv-not-configured') {
      return { ok: false, error: existing.error };
    }

    let subscriptionId = existing.id ?? input.knownSubscriptionId ?? undefined;
    let status = existing.status;

    if (!existing.found) {
      // New to beehiiv: subscribe them, with their fields set on the way in.
      const res = await fetch(`${BEEHIIV_API}/publications/${pubId}/subscriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: input.email,
          reactivate_existing: false,
          send_welcome_email: false,
          custom_fields,
          utm_source: 'europeancampaignplaybook.eu',
          utm_medium: 'crm-sync',
        }),
      });
      if (!res.ok) return { ok: false, error: `${res.status}: ${(await res.text()).slice(0, 200)}` };
      const body = (await res.json()) as { data?: { id?: string; status?: string } };
      subscriptionId = body.data?.id ?? subscriptionId;
      status = mapStatus(body.data?.status) ?? 'pending';
      return { ok: true, subscriptionId, status };
    }

    // Already known to beehiiv. Leave the subscription alone and refresh the
    // fields the newsletter segments on; a failure there is a warning, since
    // the subscription itself is already right.
    let warning: string | undefined;
    if (subscriptionId && custom_fields.length > 0) {
      const update = await fetch(`${BEEHIIV_API}/publications/${pubId}/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_fields }),
      });
      if (!update.ok) warning = `fields ${update.status}: ${(await update.text()).slice(0, 120)}`;
    }

    return { ok: true, subscriptionId, status, warning };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// How many subscribers the publication holds, and in what state, so the
// contacts table can be compared against it.
export async function beehiivStats(): Promise<Record<string, unknown>> {
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  const key = process.env.BEEHIIV_API_KEY;
  if (!pubId || !key) return { error: 'beehiiv-not-configured' };

  const byStatus: Record<string, number> = {};
  let total = 0;
  try {
    for (let page = 1; page <= 20; page += 1) {
      const res = await fetch(
        `${BEEHIIV_API}/publications/${pubId}/subscriptions?limit=100&page=${page}`,
        { headers: { Authorization: `Bearer ${key}` } }
      );
      if (!res.ok) return { error: `${res.status}: ${(await res.text()).slice(0, 200)}` };
      const body = (await res.json()) as { data?: { status?: string }[]; total_results?: number };
      const rows = body.data ?? [];
      for (const r of rows) byStatus[r.status ?? 'unknown'] = (byStatus[r.status ?? 'unknown'] ?? 0) + 1;
      total += rows.length;
      if (rows.length < 100) break;
    }
    return { subscribers: total, byStatus };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// Every subscriber, with the state beehiiv holds for them. Used to bring the
// newsletter audience into the contacts table, including the people who
// unsubscribed: knowing that is what stops us mailing them again.
export async function listBeehiivSubscribers(): Promise<
  | { ok: true; subscribers: { email: string; id: string; status: BeehiivState['status'] }[] }
  | { ok: false; error: string }
> {
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  const key = process.env.BEEHIIV_API_KEY;
  if (!pubId || !key) return { ok: false, error: 'beehiiv-not-configured' };

  const out: { email: string; id: string; status: BeehiivState['status'] }[] = [];
  try {
    for (let page = 1; page <= 60; page += 1) {
      const res = await fetch(
        `${BEEHIIV_API}/publications/${pubId}/subscriptions?limit=100&page=${page}`,
        { headers: { Authorization: `Bearer ${key}` } }
      );
      if (!res.ok) return { ok: false, error: `${res.status}: ${(await res.text()).slice(0, 200)}` };
      const body = (await res.json()) as { data?: { id?: string; email?: string; status?: string }[] };
      const rows = body.data ?? [];
      for (const r of rows) {
        if (r.email && r.id) out.push({ email: r.email, id: r.id, status: mapStatus(r.status) });
      }
      if (rows.length < 100) break;
    }
    return { ok: true, subscribers: out };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// Lightweight connectivity probe for the admin health check.
export async function beehiivHealth(): Promise<BeehiivResult> {
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  const key = process.env.BEEHIIV_API_KEY;
  if (!pubId || !key) return { ok: false, error: 'beehiiv-not-configured' };
  try {
    const res = await fetch(`${BEEHIIV_API}/publications/${pubId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return { ok: false, error: `${res.status}: ${(await res.text()).slice(0, 200)}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
