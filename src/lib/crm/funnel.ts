// The funnel's vocabulary, shared by the database, the admin panel and the
// mirror pushed to Notion. The values match the check constraints in
// supabase/schema.sql; changing one means changing the other.

export const STAGES = [
  { value: 'lead', label: 'Lead', hint: 'Knows we exist', automatic: true },
  { value: 'info_registered', label: 'Info session booked', hint: 'Registered for an info session', automatic: true },
  { value: 'info_no_show', label: 'Info session missed', hint: 'Booked one and never appeared', automatic: true },
  { value: 'info_attended', label: 'Info session attended', hint: 'Turned up, once attendance is ticked', automatic: true },
  { value: 'prospect_conversation', label: 'In conversation', hint: 'Asked for a conversation', automatic: false },
  { value: 'workshop_registered', label: 'Workshop booked', hint: 'Registered for a workshop', automatic: true },
  { value: 'workshop_no_show', label: 'Workshop missed', hint: 'Booked one and never appeared', automatic: true },
  { value: 'workshop_attended', label: 'Workshop attended', hint: 'Set by you, because the free workshop is your call', automatic: false },
  { value: 'prospect_closing', label: 'About to sign', hint: 'One step from becoming a client', automatic: false },
  { value: 'client', label: 'Client', hint: 'Paying, in whatever form', automatic: true },
  { value: 'not_now', label: 'Not now', hint: 'Asked us to come back later', automatic: false },
  { value: 'lost', label: 'Lost', hint: 'Said no', automatic: false },
  { value: 'dormant', label: 'Dormant', hint: 'Went quiet, worth another try', automatic: false },
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
  'info_registered',
  'info_no_show',
  'info_attended',
  'prospect_conversation',
  'workshop_registered',
  'workshop_no_show',
  'workshop_attended',
  'prospect_closing',
  'client',
];

// Set by a person, never by the automation.
export const HELD_STAGES: Stage[] = ['not_now', 'lost', 'dormant'];
