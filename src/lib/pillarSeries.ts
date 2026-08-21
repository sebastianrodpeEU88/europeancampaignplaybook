// Locked mapping from BRAND-SYSTEM.md §3/§5 — only 6 of the 16 taxonomy
// pillars correspond to one of the brand's six series colours. The other
// 10 intentionally get no colour (the brand system prohibits inventing
// additional series colours). Taxonomy slugs/structure are untouched by
// this — this is a display-only lookup.
const PILLAR_SERIES: Record<string, { token: string; label: string; number: string }> = {
  strategy: { token: 'series-01-strategy', label: 'strategy that moves people', number: '01' },
  'narrative-messaging-argumentation': { token: 'series-02-narrative', label: 'narrative that travels', number: '02' },
  'fieldwork-organising-mobilisation': { token: 'series-03-organising', label: 'field organising', number: '03' },
  'digital-channels-content': { token: 'series-04-digital', label: 'digital mobilisation', number: '04' },
  'fundraising-finance-commercial': { token: 'series-05-fundraising', label: 'fundraising for power', number: '05' },
  'governance-ethics-compliance': { token: 'series-06-compliance', label: 'eu campaign compliance', number: '06' },
};

const SERIES_HEX: Record<string, string> = {
  'series-01-strategy': '#dd3c13',
  'series-02-narrative': '#A4331D',
  'series-03-organising': '#2B5F29',
  'series-04-digital': '#432973',
  'series-05-fundraising': '#C78819',
  'series-06-compliance': '#0F403D',
};

export function seriesForPillar(pillarSlug: string) {
  return PILLAR_SERIES[pillarSlug] ?? null;
}

// Inline-style hex for contexts that can't use the Tailwind token class
// (e.g. dynamic borderLeft) — mirrors the --color-{token} values in
// globals.css exactly.
export function seriesHex(pillarSlug: string): string | null {
  const series = PILLAR_SERIES[pillarSlug];
  return series ? SERIES_HEX[series.token] : null;
}
