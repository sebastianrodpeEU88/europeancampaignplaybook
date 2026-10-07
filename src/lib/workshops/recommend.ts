/**
 * Should this person get the free workshop?
 *
 * The scoring is the one worked out against the real funnel on 2026-10-06, by
 * asking what the fifty people who actually booked something had in common
 * while they were still leads. Two findings shaped it, and both are easy to
 * get wrong:
 *
 * Signing in is the only signal that cannot be faked. Having an account and
 * being website-sourced look enormous (lifts of 286 and 179) but both are
 * created by the act of booking, so they predict nothing on their own.
 *
 * A confirmed email address proves nothing either. Mail-security scanners
 * click confirmation links automatically, which is how a dozen August bot
 * signups ended up "confirmed" without a person ever touching them. The tell
 * is a confirmed account that has never once signed in.
 *
 * This returns a recommendation and its reasons, never a decision. A person
 * reads it and decides.
 */

export type ClaimSignal = { label: string; weight: number };

export type Recommendation = {
  verdict: 'accept' | 'look' | 'reject';
  score: number;
  signals: ClaimSignal[];
  /** Things that should stop an approval regardless of score. */
  blockers: string[];
};

export type ClaimantFacts = {
  email: string;
  stage: string | null;
  status: string | null;
  newsletterStatus: string | null;
  emailsSent: number | null;
  emailsClicked: number | null;
  openRate: number | null;
  careerStage: string | null;
  organisationType: string | null;
  company: string | null;
  position: string | null;
  firstName: string | null;
  /** Account facts, which the contact row does not hold. */
  accountConfirmed: boolean;
  accountSignedIn: boolean;
  /** Already used, which should make a claim impossible rather than unwise. */
  freeWorkshopUsedAt: string | null;
  priorRegistrations: number;
  attendedCount: number;
  noShowCount: number;
};

const ROLE_ADDRESS =
  /^(info|admin|office|contact|hello|sales|accounting|procurement|billing|support|team|no-?reply|postmaster|webmaster|secretariat|media|press|comms?|communications)@/i;

// A scanner opens and clicks everything it is handed, sustained over dozens of
// emails. A person does not.
const looksLikeScanner = (f: ClaimantFacts) =>
  (f.emailsSent ?? 0) >= 8 && (f.emailsClicked ?? 0) / (f.emailsSent || 1) >= 0.6;

export function recommend(f: ClaimantFacts): Recommendation {
  const signals: ClaimSignal[] = [];
  const blockers: string[] = [];
  const add = (label: string, weight: number) => signals.push({ label, weight });

  // ── Things that should stop an approval on their own ──────────────────
  if (f.freeWorkshopUsedAt) blockers.push('Their free workshop is already recorded as used.');
  if (f.status === 'junk') blockers.push('The contact is set aside as junk.');
  if (f.stage === 'lost') blockers.push('The contact is marked lost.');
  if (f.stage === 'dormant') blockers.push('Parked as dormant, which is where competitors and non-prospects go.');
  // A paying member asking for a free place means the two sides of the record
  // have drifted apart, because the site gates on the subscription while the
  // CRM carries the label. Two corporate clients recorded by hand have no
  // account and so no subscription, which is exactly how somebody who has
  // already paid could be shown this button. Refuse and let a person look.
  if (f.stage === 'client') blockers.push('Already a client. Check whether their membership is missing from the site.');
  if (f.stage === 'former_client') blockers.push('A former client, so this is a renewal conversation rather than a free place.');
  if (ROLE_ADDRESS.test(f.email)) blockers.push('Shared inbox rather than a person.');
  if (f.accountConfirmed && !f.accountSignedIn) {
    blockers.push('Confirmed the email but has never signed in, which is the mail-scanner pattern.');
  }
  if (looksLikeScanner(f)) {
    blockers.push(
      `Clicks a link in most emails sent (${f.emailsClicked} of ${f.emailsSent}), which reads as mail security rather than a reader.`
    );
  }
  if (f.noShowCount >= 2) {
    blockers.push(`Has not turned up ${f.noShowCount} times.`);
  }

  // ── Evidence of a real person who means it ────────────────────────────
  if (f.accountSignedIn) add('Has signed in to the site', 7);
  if (f.careerStage || f.organisationType) add('Filled in a profile', 3);
  if (f.company) add('Gave an organisation', 1);
  if (f.position) add('Gave a job title', 1);
  if (f.firstName) add('Gave a name', 1);

  const clicks = f.emailsClicked ?? 0;
  if (clicks >= 5) add(`Clicked ${clicks} newsletter links`, 4);
  else if (clicks >= 3) add(`Clicked ${clicks} newsletter links`, 3);
  else if (clicks >= 1) add(`Clicked ${clicks} newsletter link${clicks > 1 ? 's' : ''}`, 1);

  if ((f.openRate ?? 0) >= 70 && (f.emailsSent ?? 0) >= 8) {
    add(`Opens ${Math.round(f.openRate as number)}% of what we send`, 2);
  }
  if (f.newsletterStatus === 'subscribed') add('Confirmed newsletter subscriber', 1);
  if (f.newsletterStatus === 'pending') add('Never confirmed the newsletter', -1);

  if (f.attendedCount > 0) add(`Has attended ${f.attendedCount} session${f.attendedCount > 1 ? 's' : ''}`, 3);
  if (f.stage === 'info_attended') add('Came to an info session', 3);
  if (f.noShowCount === 1) add('Booked once and did not appear', -2);

  const score = signals.reduce((n, s) => n + s.weight, 0);

  // Blockers decide. Otherwise the score only separates "clearly fine" from
  // "worth a look", because the cost of a wrong accept here is one seat.
  const verdict: Recommendation['verdict'] = blockers.length ? 'reject' : score >= 8 ? 'accept' : 'look';

  return { verdict, score, signals, blockers };
}

export const REJECT_REASONS = {
  already_used: 'You have already used your free workshop',
  members_only: 'This one is for members only',
  not_eligible: 'The free workshop is for people new to us',
  no_show: 'A previous booking was not attended',
  shared_inbox: 'We need a named person rather than a shared inbox',
  other: 'Something else, explained by hand',
} as const;

export type RejectReason = keyof typeof REJECT_REASONS;
