// The funnel's vocabulary, shared by the database, the admin panel and the
// mirror pushed to Notion. The values match the check constraints in
// supabase/schema.sql; changing one means changing the other.

export const STAGES = [
  { value: 'lead', label: 'Lead', hint: 'Knows we exist', automatic: true },
  { value: 'reached_out', label: 'Reached out', hint: 'You have written to them yourself', automatic: false },
  { value: 'reached_out_linkedin', label: 'Reached out via LinkedIn', hint: 'Written to on LinkedIn, usually because email bounced', automatic: false },
  { value: 'linkedin_lead', label: 'LinkedIn lead', hint: 'Came through a LinkedIn lead-gen form', automatic: false },
  { value: 'info_registered', label: 'Info session booked', hint: 'Registered for an info session', automatic: true },
  { value: 'info_no_show', label: 'Info session missed', hint: 'Booked one and never appeared', automatic: true },
  { value: 'info_attended', label: 'Info session attended', hint: 'Turned up, once attendance is ticked', automatic: true },
  { value: 'prospect_conversation', label: 'In conversation', hint: 'Asked for a conversation', automatic: false },
  { value: 'workshop_registered', label: 'Workshop booked', hint: 'Registered for a workshop', automatic: true },
  { value: 'workshop_no_show', label: 'Workshop missed', hint: 'Booked one and never appeared', automatic: true },
  { value: 'workshop_attended', label: 'Workshop attended', hint: 'Set by you, because the free workshop is your call', automatic: false },
  { value: 'prospect_closing', label: 'About to sign', hint: 'One step from becoming a client', automatic: false },
  { value: 'client', label: 'Client', hint: 'Paying, in whatever form', automatic: true },
  { value: 'former_client', label: 'Former client', hint: 'Paid once, cancelled; only paying again moves them back', automatic: true },
  { value: 'not_now', label: 'Not now', hint: 'Asked us to come back later', automatic: false },
  { value: 'lost', label: 'Lost', hint: 'Said no', automatic: false },
  { value: 'dormant', label: 'Dormant', hint: 'Went quiet; a booking lifts them out again', automatic: false },
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

// The order the funnel runs in, for counting and for the board. Lost, Not now
// and Dormant sit outside it, so none of them is a step the automation walks
// towards. Dormant ranks level with Lead in stage_rank, which is how a dormant
// contact who books something climbs back into the funnel.
export const FUNNEL_ORDER: Stage[] = [
  'lead',
  'reached_out',
  'reached_out_linkedin',
  'linkedin_lead',
  'info_registered',
  'info_no_show',
  'info_attended',
  'prospect_conversation',
  'workshop_registered',
  'workshop_no_show',
  'workshop_attended',
  'prospect_closing',
  'client',
  'former_client',
];

// Decisions with a reason behind them, which the automation never overrides.
// Dormant sits outside this set: it is only ever set by a person, and a
// booking or a payment is evidence enough that somebody came back.
export const HELD_STAGES: Stage[] = ['not_now', 'lost'];

// Where somebody is in the renewal cycle. Held beside the stage, because a
// client whose membership ends next month is both things at once.
export const RENEWALS = [
  { value: 'none', label: '—', hint: 'Nothing due', automatic: true },
  { value: 'due_next_month', label: 'Renewal next month', hint: 'Membership ends within 31 days', automatic: true },
  { value: 'requested', label: 'Renewal requested', hint: 'You have asked them to renew', automatic: false },
  { value: 'overdue', label: 'Renewal overdue', hint: 'Membership has ended', automatic: true },
  { value: 'payment_failed', label: 'Payment failed', hint: 'A card stopped working: reach them before the membership lapses', automatic: true },
  { value: 'expired_follow_up', label: 'Expired, follow up', hint: 'Expired, and they asked to be approached later', automatic: false },
] as const;

export type RenewalStatus = (typeof RENEWALS)[number]['value'];

export const RENEWAL_LABELS: Record<string, string> = Object.fromEntries(
  RENEWALS.map((r) => [r.value, r.label])
);
