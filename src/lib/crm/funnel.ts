// The funnel's vocabulary, shared by the database, the admin panel and the
// mirror pushed to Notion. The values match the check constraints in
// supabase/schema.sql; changing one means changing the other.

export const STAGES = [
  { value: 'lead', label: 'Lead', hint: 'Knows we exist', automatic: true },
  { value: 'prospect_info_session', label: 'Info session', hint: 'Signed up to a free info session', automatic: true },
  { value: 'prospect_conversation', label: 'In conversation', hint: 'Asked for a conversation', automatic: false },
  { value: 'prospect_workshop', label: 'Workshop', hint: 'Attended a workshop', automatic: true },
  { value: 'prospect_closing', label: 'About to sign', hint: 'One step from becoming a client', automatic: false },
  { value: 'client', label: 'Client', hint: 'Paying, in whatever form', automatic: true },
  { value: 'lost', label: 'Lost', hint: 'Said no, or went cold for good', automatic: false },
  { value: 'dormant', label: 'Dormant', hint: 'Parked, worth coming back to', automatic: false },
] as const;

export type Stage = (typeof STAGES)[number]['value'];

export const SOURCES = [
  { value: 'linkedin_ads', label: 'LinkedIn ads' },
  { value: 'instagram_ads', label: 'Instagram ads' },
  { value: 'organic_search', label: 'Organic search' },
  { value: 'website_request', label: 'Request on the website' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'event', label: 'Event' },
  { value: 'referral', label: 'Referral' },
  { value: 'other', label: 'Other' },
] as const;

export type AcquisitionSource = (typeof SOURCES)[number]['value'];

export const CLIENT_TYPES = [
  { value: 'corporate', label: 'Corporate' },
  { value: 'legacy', label: 'Legacy' },
  { value: 'individual', label: 'Individual' },
] as const;

export type ClientType = (typeof CLIENT_TYPES)[number]['value'];

export const STAGE_LABELS: Record<string, string> = Object.fromEntries(
  STAGES.map((s) => [s.value, s.label])
);
export const SOURCE_LABELS: Record<string, string> = Object.fromEntries(
  SOURCES.map((s) => [s.value, s.label])
);
export const CLIENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  CLIENT_TYPES.map((s) => [s.value, s.label])
);

// The order the funnel runs in, for counting and for the board. Lost and
// dormant sit outside it, which is why the automation can never reach them.
export const FUNNEL_ORDER: Stage[] = [
  'lead',
  'prospect_info_session',
  'prospect_conversation',
  'prospect_workshop',
  'prospect_closing',
  'client',
];
