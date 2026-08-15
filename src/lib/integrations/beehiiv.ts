import 'server-only';

// Beehiiv newsletter subscription via the v2 REST API (no SDK).
const BEEHIIV_API = 'https://api.beehiiv.com/v2';

export type BeehiivResult = { ok: boolean; error?: string };

// Subscribe an email to the publication. Idempotent: reactivate_existing means
// re-subscribing an existing address succeeds rather than erroring. We don't
// send Beehiiv's welcome email — the site already handles its own onboarding —
// but that's a one-line change if you want a double opt-in flow later.
export async function subscribeToBeehiiv(input: { email: string }): Promise<BeehiivResult> {
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
