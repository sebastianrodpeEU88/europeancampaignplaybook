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
