import 'server-only';

// Notion CRM sync via the REST API (no SDK, to avoid a dependency). Uses the
// stable 2022-06-28 API version, which supports databases/{id}/query by
// database_id for single-source databases like the CRM.
const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

export type CrmContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  careerStage?: string | null; // human-readable label, not the form value
  organisationType?: string | null; // human-readable label
  company?: string | null;
  newsletterOptIn: boolean;
};

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

// Notion rich_text has a 2000-char per-item ceiling.
function richText(value?: string | null) {
  return value ? { rich_text: [{ text: { content: value.slice(0, 2000) } }] } : { rich_text: [] };
}

function buildProperties(c: CrmContact): Record<string, unknown> {
  const fullName = [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || c.email;
  const props: Record<string, unknown> = {
    'Contact Name': { title: [{ text: { content: fullName } }] },
    'First Name': richText(c.firstName),
    Email: { email: c.email },
    Phone: { phone_number: c.phone || null },
    'Career Stage': richText(c.careerStage),
    'Organisation Type': richText(c.organisationType),
    Company: richText(c.company),
    'Newsletter opt-in': { checkbox: c.newsletterOptIn },
  };
  // Only stamp the opt-in date when they actually opted in.
  if (c.newsletterOptIn) {
    props['Newsletter opt-in date'] = { date: { start: new Date().toISOString().slice(0, 10) } };
  }
  return props;
}

export type NotionSyncResult = { ok: boolean; action?: 'created' | 'updated'; error?: string };

// Upsert a CRM contact keyed on Email: update the existing row if one matches,
// otherwise create a new one. Never throws — returns a result object so callers
// (a background `after()` task) can log without breaking the user flow.
export async function upsertCrmContact(c: CrmContact): Promise<NotionSyncResult> {
  const dbId = process.env.NOTION_CRM_DATABASE_ID;
  if (!dbId || !process.env.NOTION_API_KEY) return { ok: false, error: 'notion-not-configured' };

  try {
    const query = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
      method: 'POST',
      headers: notionHeaders(),
      body: JSON.stringify({ filter: { property: 'Email', email: { equals: c.email } }, page_size: 1 }),
    });
    if (!query.ok) return { ok: false, error: `query ${query.status}: ${(await query.text()).slice(0, 200)}` };

    const existing = (await query.json())?.results?.[0];
    const properties = buildProperties(c);

    if (existing) {
      // On update, don't touch Source or the sales pipeline status — those are
      // managed by hand in the CRM; we only refresh the contact's own fields.
      const res = await fetch(`${NOTION_API}/pages/${existing.id}`, {
        method: 'PATCH',
        headers: notionHeaders(),
        body: JSON.stringify({ properties }),
      });
      if (!res.ok) return { ok: false, error: `update ${res.status}: ${(await res.text()).slice(0, 200)}` };
      return { ok: true, action: 'updated' };
    }

    // New contact — stamp the lead source as the website.
    const res = await fetch(`${NOTION_API}/pages`, {
      method: 'POST',
      headers: notionHeaders(),
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties: { ...properties, Source: { multi_select: [{ name: 'Website' }] } },
      }),
    });
    if (!res.ok) return { ok: false, error: `create ${res.status}: ${(await res.text()).slice(0, 200)}` };
    return { ok: true, action: 'created' };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// Lightweight connectivity probe for the admin health check.
export async function notionHealth(): Promise<NotionSyncResult> {
  const dbId = process.env.NOTION_CRM_DATABASE_ID;
  if (!dbId || !process.env.NOTION_API_KEY) return { ok: false, error: 'notion-not-configured' };
  try {
    const res = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
      method: 'POST',
      headers: notionHeaders(),
      body: JSON.stringify({ page_size: 1 }),
    });
    if (!res.ok) return { ok: false, error: `${res.status}: ${(await res.text()).slice(0, 200)}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
