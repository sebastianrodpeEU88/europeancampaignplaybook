// Where somebody came from, captured at the moment they sign up.
//
// Deliberately storage-free: no cookie, nothing kept on anyone's device, so
// this stays inside "strictly necessary" and the cookie policy stays true.
// The campaign parameters are read from the link the person arrived on, and
// from the referrer their browser sends with that request, then travel with
// the signup into the account's own metadata.
//
// The cost of that choice is coverage: a link that lands straight on the
// signup or login page carries its parameters, and somebody who browses for a
// while first arrives with nothing to read. Point ad campaigns at the signup
// page and the source fills itself.

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  referrer?: string;
  landing?: string;
};

const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;
// The click ids the ad platforms add, which say "paid" even when the utm tags
// are missing.
const CLICK_IDS = { li_fat_id: 'linkedin', fbclid: 'meta', igshid: 'meta', gclid: 'google' } as const;

const SEARCH_ENGINES = ['google.', 'bing.', 'duckduckgo.', 'ecosia.', 'qwant.', 'yahoo.', 'startpage.'];

function host(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

// Reads what the request carries. Returns null when there is nothing to record.
export function readAttribution(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
  referer?: string | null,
  landing?: string
): Attribution | null {
  const get = (key: string): string | undefined => {
    if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const attr: Attribution = {};
  for (const p of PARAMS) {
    const v = get(p);
    if (v) attr[p] = v.slice(0, 120);
  }
  for (const id of Object.keys(CLICK_IDS)) {
    if (get(id)) attr.utm_medium = attr.utm_medium ?? 'paid';
    if (get(id) && !attr.utm_source) attr.utm_source = CLICK_IDS[id as keyof typeof CLICK_IDS];
  }

  const ref = referer ?? undefined;
  // An internal referrer says nothing about where the person came from.
  if (ref && !host(ref).endsWith('campaignplaybook.eu')) attr.referrer = ref.slice(0, 300);
  if (landing) attr.landing = landing.slice(0, 200);

  return Object.keys(attr).length > 0 ? attr : null;
}

const isPaid = (medium?: string) =>
  Boolean(medium && /cpc|ppc|paid|ads?$|paid.?social|display/i.test(medium));

// One of the funnel's sources, or null when the signal is too weak to guess.
// Kept conservative on purpose: a wrong source is worse than an empty one,
// because it quietly skews every channel comparison afterwards.
export function sourceFromAttribution(attr: Attribution | null): string | null {
  if (!attr) return null;
  const source = (attr.utm_source ?? '').toLowerCase();
  const medium = (attr.utm_medium ?? '').toLowerCase();
  const refHost = host(attr.referrer);

  if (/linkedin/.test(source) && isPaid(medium)) return 'linkedin_ads';
  if (/instagram|facebook|meta/.test(source) && isPaid(medium)) return 'instagram_ads';
  if (/beehiiv|newsletter|email/.test(source) || /email/.test(medium)) return 'newsletter';
  if (/event|eventbrite|webinar/.test(source)) return 'event';
  if (/organic.?search/.test(medium) || SEARCH_ENGINES.some((e) => refHost.includes(e))) return 'organic_search';
  if (/referral/.test(medium) || (refHost && !refHost.endsWith('campaignplaybook.eu'))) return 'referral';
  // Campaign tags with no paid signal: somebody shared a tagged link.
  if (source) return 'referral';
  return null;
}

// What the signup form carries through, as plain fields, so nothing has to be
// stored anywhere in between.
export function attributionFields(attr: Attribution | null): Record<string, string> {
  if (!attr) return {};
  return Object.fromEntries(Object.entries(attr).filter(([, v]) => Boolean(v))) as Record<string, string>;
}
