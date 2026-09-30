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
  membershipPlan?: string | null;
  membershipSource?: string | null;
  membershipStatus?: string | null;
  renewal?: string | null;
  memberSince?: string | null;
  eventsRegistered?: number | null;
  lastEvent?: string | null;
  lastEventAt?: string | null;
  bootcampDays?: number | null;
  source?: string | null;
  stage?: string | null;
  infoSessions?: string | null;
  workshops?: string | null;
  freeWorkshopUsed?: boolean;
  acquisitionSource?: string | null;
  clientType?: string | null;
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

async function getSchema(dbId: string): Promise<{ schema: Schema } | { error: string }> {
  const cached = schemaCache.get(dbId);
  if (cached && Date.now() - cached.at < SCHEMA_TTL_MS) return { schema: cached.schema };

  const read = (properties: Record<string, { type?: string }> | undefined): Schema => {
    const schema: Schema = {};
    for (const [name, prop] of Object.entries(properties ?? {})) {
      if (prop?.type) schema[name] = prop.type;
    }
    return schema;
  };

  // The database itself describes its columns, when the integration is allowed
  // to read it.
  const res = await fetch(`${NOTION_API}/databases/${dbId}`, { headers: notionHeaders() });
  if (res.ok) {
    const body = (await res.json()) as { properties?: Record<string, { type?: string }> };
    const schema = read(body.properties);
    if (Object.keys(schema).length > 0) {
      schemaCache.set(dbId, { at: Date.now(), schema });
      return { schema };
    }
  }
  const dbError = res.ok ? 'no properties' : `${res.status}: ${(await res.text()).slice(0, 160)}`;

  // Otherwise take the shape from a row, which only needs the query permission
  // the sync already relies on.
  const sample = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
    method: 'POST',
    headers: notionHeaders(),
    body: JSON.stringify({ page_size: 1 }),
  });
  if (sample.ok) {
    const body = (await sample.json()) as { results?: { properties?: Record<string, { type?: string }> }[] };
    const schema = read(body.results?.[0]?.properties);
    if (Object.keys(schema).length > 0) {
      schemaCache.set(dbId, { at: Date.now(), schema });
      return { schema };
    }
  }

  return { error: `schema unavailable (database ${dbError})` };
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
    ['Membership plan', 'rich_text', { rich_text: c.membershipPlan ? [{ text: { content: text(c.membershipPlan) } }] : [] }],
    ['Membership source', 'rich_text', { rich_text: c.membershipSource ? [{ text: { content: text(c.membershipSource) } }] : [] }],
    ['Renewal', 'select', c.renewal ? { select: { name: c.renewal } } : { select: null }],
    ['Renewal', 'rich_text', { rich_text: c.renewal ? [{ text: { content: text(c.renewal) } }] : [] }],
    ['Membership status', 'rich_text', { rich_text: c.membershipStatus ? [{ text: { content: text(c.membershipStatus) } }] : [] }],
    ['Member since', 'date', { date: isoDate(c.memberSince) ? { start: isoDate(c.memberSince) } : null }],
    ['Events registered', 'number', { number: c.eventsRegistered ?? 0 }],
    ['Last event', 'rich_text', { rich_text: c.lastEvent ? [{ text: { content: text(c.lastEvent) } }] : [] }],
    ['Last event date', 'date', { date: isoDate(c.lastEventAt) ? { start: isoDate(c.lastEventAt) } : null }],
    ['Bootcamp days', 'number', { number: c.bootcampDays ?? 0 }],
    ['Info sessions', 'rich_text', { rich_text: c.infoSessions ? [{ text: { content: text(c.infoSessions) } }] : [] }],
    ['Workshops', 'rich_text', { rich_text: c.workshops ? [{ text: { content: text(c.workshops) } }] : [] }],
    ['Free workshop used', 'checkbox', { checkbox: Boolean(c.freeWorkshopUsed) }],
    ['Stage', 'select', c.stage ? { select: { name: c.stage } } : { select: null }],
    ['Stage', 'rich_text', { rich_text: c.stage ? [{ text: { content: text(c.stage) } }] : [] }],
    ['Acquisition source', 'select', c.acquisitionSource ? { select: { name: c.acquisitionSource } } : { select: null }],
    ['Acquisition source', 'rich_text', { rich_text: c.acquisitionSource ? [{ text: { content: text(c.acquisitionSource) } }] : [] }],
    ['Client type', 'select', c.clientType ? { select: { name: c.clientType } } : { select: null }],
    ['Client type', 'rich_text', { rich_text: c.clientType ? [{ text: { content: text(c.clientType) } }] : [] }],
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
    const read = await getSchema(dbId);
    if ('error' in read) return { ok: false, error: read.error };
    const { schema } = read;
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

// Every row in the CRM with an email on it, so the contacts table can take in
// the people who predate it. Read-only: nothing in Notion is touched.
export async function listCrmContacts(): Promise<
  | { ok: true; contacts: { email: string; firstName?: string; lastName?: string; pageId: string }[] }
  | { ok: false; error: string }
> {
  const dbId = process.env.NOTION_CRM_DATABASE_ID;
  if (!dbId || !process.env.NOTION_API_KEY) return { ok: false, error: 'notion-not-configured' };

  const out: { email: string; firstName?: string; lastName?: string; pageId: string }[] = [];
  let cursor: string | undefined;

  try {
    for (let page = 0; page < 40; page += 1) {
      const res = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
        method: 'POST',
        headers: notionHeaders(),
        body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
      });
      if (!res.ok) return { ok: false, error: `query ${res.status}: ${(await res.text()).slice(0, 200)}` };
      const body = (await res.json()) as {
        results?: { id: string; properties?: Record<string, { type?: string; email?: string; title?: { plain_text?: string }[]; rich_text?: { plain_text?: string }[] }> }[];
        has_more?: boolean;
        next_cursor?: string | null;
      };

      for (const row of body.results ?? []) {
        const props = row.properties ?? {};
        const emailProp = Object.values(props).find((p) => p.type === 'email' && p.email);
        const email = emailProp?.email;
        if (!email) continue;
        const first = props['First Name']?.rich_text?.[0]?.plain_text;
        const full = props['Contact Name']?.title?.map((t) => t.plain_text).join('') ?? '';
        out.push({
          email,
          firstName: first || full.split(' ')[0] || undefined,
          lastName: full.split(' ').slice(1).join(' ') || undefined,
          pageId: row.id,
        });
      }

      if (!body.has_more || !body.next_cursor) break;
      cursor = body.next_cursor;
    }
    return { ok: true, contacts: out };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// What the integration can actually reach, for when the CRM stops answering:
// reading the database, querying it, and the columns a row reveals.
export async function notionDiagnostics(): Promise<Record<string, unknown>> {
  const dbId = process.env.NOTION_CRM_DATABASE_ID;
  if (!dbId || !process.env.NOTION_API_KEY) return { configured: false };

  const out: Record<string, unknown> = { configured: true, databaseId: dbId };

  const get = await fetch(`${NOTION_API}/databases/${dbId}`, { headers: notionHeaders() });
  out.getDatabase = { status: get.status, body: (await get.text()).slice(0, 300) };

  const query = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
    method: 'POST',
    headers: notionHeaders(),
    body: JSON.stringify({ page_size: 1 }),
  });
  if (query.ok) {
    const body = (await query.json()) as { results?: { id?: string; properties?: Record<string, { type?: string }> }[] };
    const row = body.results?.[0];
    out.query = {
      status: query.status,
      rows: body.results?.length ?? 0,
      samplePageId: row?.id ?? null,
      columns: Object.entries(row?.properties ?? {}).map(([name, p]) => `${name} (${p.type})`),
    };
  } else {
    out.query = { status: query.status, body: (await query.text()).slice(0, 300) };
  }

  // The integration's own view of what it has been given access to.
  const search = await fetch(`${NOTION_API}/search`, {
    method: 'POST',
    headers: notionHeaders(),
    body: JSON.stringify({ filter: { property: 'object', value: 'database' }, page_size: 10 }),
  });
  if (search.ok) {
    const body = (await search.json()) as { results?: { id?: string; title?: { plain_text?: string }[] }[] };
    out.sharedWithIntegration = (body.results ?? []).map((d) => ({
      id: d.id,
      title: d.title?.map((t) => t.plain_text).join('') || '(untitled)',
    }));
  } else {
    out.sharedWithIntegration = { status: search.status, body: (await search.text()).slice(0, 200) };
  }

  return out;
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
