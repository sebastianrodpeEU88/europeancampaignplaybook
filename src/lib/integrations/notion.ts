import 'server-only';

// Notion CRM sync via the REST API (no SDK, to avoid a dependency). Uses the
// stable 2022-06-28 API version, which supports databases/{id}/query by
// database_id for single-source databases like the CRM.
//
// Notion is a mirror of the contacts table, never the master: the sync worker
// (src/lib/crm/sync.ts) writes here, keyed on the page id it stored the first
// time, so the same person can only ever occupy one page.
const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

export type NotionContact = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  careerStage?: string | null; // human-readable label, not the form value
  organisationType?: string | null; // human-readable label
  company?: string | null;
  newsletterOptIn: boolean;
  membershipTier?: string | null;
  membershipStatus?: string | null;
  memberSince?: string | null;
  eventsRegistered?: number | null;
  lastEvent?: string | null;
  lastEventAt?: string | null;
  bootcampDays?: number | null;
  source?: string | null;
};

export type NotionSyncResult = {
  ok: boolean;
  action?: 'created' | 'updated';
  pageId?: string;
  error?: string;
};

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

// Notion rich_text has a 2000-char per-item ceiling.
function text(value: string) {
  return value.slice(0, 2000);
}

function isoDate(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

// The database's own property names and types, fetched once per worker run.
// Writing a property Notion does not have is an error, so every value is
// checked against the live schema first. Add a column in Notion and it starts
// filling by itself; remove one and the sync carries on without it.
type Schema = Record<string, string>;

const schemaCache = new Map<string, { at: number; schema: Schema }>();
const SCHEMA_TTL_MS = 5 * 60 * 1000;

async function getSchema(dbId: string): Promise<Schema | null> {
  const cached = schemaCache.get(dbId);
  if (cached && Date.now() - cached.at < SCHEMA_TTL_MS) return cached.schema;

  const res = await fetch(`${NOTION_API}/databases/${dbId}`, { headers: notionHeaders() });
  if (!res.ok) return null;
  const body = (await res.json()) as { properties?: Record<string, { type?: string }> };
  const schema: Schema = {};
  for (const [name, prop] of Object.entries(body.properties ?? {})) {
    if (prop?.type) schema[name] = prop.type;
  }
  schemaCache.set(dbId, { at: Date.now(), schema });
  return schema;
}

// A value for each property Notion might hold, by the name the CRM uses.
// Anything the database does not have is dropped.
function buildProperties(c: NotionContact, schema: Schema): Record<string, unknown> {
  const fullName = [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || c.email;

  const candidates: [string, string, unknown][] = [
    ['Contact Name', 'title', { title: [{ text: { content: text(fullName) } }] }],
    ['First Name', 'rich_text', { rich_text: c.firstName ? [{ text: { content: text(c.firstName) } }] : [] }],
    ['Last Name', 'rich_text', { rich_text: c.lastName ? [{ text: { content: text(c.lastName) } }] : [] }],
    ['Email', 'email', { email: c.email }],
    ['Phone', 'phone_number', { phone_number: c.phone || null }],
    ['Career Stage', 'rich_text', { rich_text: c.careerStage ? [{ text: { content: text(c.careerStage) } }] : [] }],
    ['Organisation Type', 'rich_text', { rich_text: c.organisationType ? [{ text: { content: text(c.organisationType) } }] : [] }],
    ['Company', 'rich_text', { rich_text: c.company ? [{ text: { content: text(c.company) } }] : [] }],
    ['Newsletter opt-in', 'checkbox', { checkbox: c.newsletterOptIn }],
    ['Membership tier', 'rich_text', { rich_text: c.membershipTier ? [{ text: { content: text(c.membershipTier) } }] : [] }],
    ['Membership status', 'rich_text', { rich_text: c.membershipStatus ? [{ text: { content: text(c.membershipStatus) } }] : [] }],
    ['Member since', 'date', { date: isoDate(c.memberSince) ? { start: isoDate(c.memberSince) } : null }],
    ['Events registered', 'number', { number: c.eventsRegistered ?? 0 }],
    ['Last event', 'rich_text', { rich_text: c.lastEvent ? [{ text: { content: text(c.lastEvent) } }] : [] }],
    ['Last event date', 'date', { date: isoDate(c.lastEventAt) ? { start: isoDate(c.lastEventAt) } : null }],
    ['Bootcamp days', 'number', { number: c.bootcampDays ?? 0 }],
  ];

  const props: Record<string, unknown> = {};
  for (const [name, type, value] of candidates) {
    if (schema[name] === type) props[name] = value;
  }

  // Stamped only when the person opted in, and only if the column exists.
  if (c.newsletterOptIn && schema['Newsletter opt-in date'] === 'date') {
    props['Newsletter opt-in date'] = { date: { start: new Date().toISOString().slice(0, 10) } };
  }

  return props;
}

// Write a contact to its page: patch the page we already know about, fall back
// to the one matching this email, and create a page when neither exists. The
// page id travels back to the contacts table, so the next write goes straight
// to the same page.
//
// On update the sales pipeline fields (Source, status, notes) are left alone —
// those are the part of Notion that people manage by hand.
export async function syncContactPage(
  c: NotionContact,
  knownPageId?: string | null
): Promise<NotionSyncResult> {
  const dbId = process.env.NOTION_CRM_DATABASE_ID;
  if (!dbId || !process.env.NOTION_API_KEY) return { ok: false, error: 'notion-not-configured' };

  try {
    const schema = await getSchema(dbId);
    if (!schema) return { ok: false, error: 'notion-schema-unavailable' };
    const properties = buildProperties(c, schema);

    let pageId = knownPageId ?? null;

    if (!pageId) {
      const query = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
        method: 'POST',
        headers: notionHeaders(),
        body: JSON.stringify({
          filter: { property: 'Email', email: { equals: c.email } },
          page_size: 1,
        }),
      });
      if (!query.ok) return { ok: false, error: `query ${query.status}: ${(await query.text()).slice(0, 200)}` };
      pageId = (await query.json())?.results?.[0]?.id ?? null;
    }

    if (pageId) {
      const res = await fetch(`${NOTION_API}/pages/${pageId}`, {
        method: 'PATCH',
        headers: notionHeaders(),
        body: JSON.stringify({ properties }),
      });
      // A page that was deleted or moved: forget the id and create a fresh one.
      if (res.status === 404 && knownPageId) return syncContactPage(c, null);
      if (!res.ok) return { ok: false, error: `update ${res.status}: ${(await res.text()).slice(0, 200)}` };
      return { ok: true, action: 'updated', pageId };
    }

    const create = await fetch(`${NOTION_API}/pages`, {
      method: 'POST',
      headers: notionHeaders(),
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties: {
          ...properties,
          ...(schema.Source === 'multi_select'
            ? { Source: { multi_select: [{ name: c.source || 'Website' }] } }
            : {}),
        },
      }),
    });
    if (!create.ok) return { ok: false, error: `create ${create.status}: ${(await create.text()).slice(0, 200)}` };
    const created = (await create.json()) as { id?: string };
    return { ok: true, action: 'created', pageId: created.id };
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
