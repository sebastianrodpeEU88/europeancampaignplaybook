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
};

export type BeehiivSyncResult = {
  ok: boolean;
  subscriptionId?: string;
  warning?: string;
  error?: string;
};

const FIELD_KINDS: Record<keyof BeehiivFields, 'string' | 'integer'> = {
  membership_tier: 'string',
  membership_status: 'string',
  events_registered: 'integer',
  bootcamp_days: 'integer',
  last_event: 'string',
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

// Subscribe (or reactivate) the address and set its fields. Idempotent, so the
// worker can run it as often as it likes.
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

    const res = await fetch(`${BEEHIIV_API}/publications/${pubId}/subscriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email,
        reactivate_existing: true,
        send_welcome_email: false,
        custom_fields,
        utm_source: 'europeancampaignplaybook.eu',
        utm_medium: 'crm-sync',
      }),
    });
    if (!res.ok) return { ok: false, error: `${res.status}: ${(await res.text()).slice(0, 200)}` };

    const body = (await res.json()) as { data?: { id?: string } };
    const subscriptionId = body.data?.id ?? input.knownSubscriptionId ?? undefined;

    // Creating covers a new subscriber's fields; an existing one takes them
    // through an update. A failure here leaves the subscription correct, so it
    // travels back as a warning rather than an error.
    let warning: string | undefined;
    if (subscriptionId && custom_fields.length > 0) {
      const update = await fetch(`${BEEHIIV_API}/publications/${pubId}/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_fields }),
      });
      if (!update.ok) warning = `fields ${update.status}: ${(await update.text()).slice(0, 120)}`;
    }

    return { ok: true, subscriptionId, warning };
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
