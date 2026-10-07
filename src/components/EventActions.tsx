'use client';

import { useEffect, useState, useTransition } from 'react';
import { routes } from '@/lib/routes';
import { registerForEvent, cancelRegistration } from '@/lib/event-actions';
import { claimFreeWorkshop, readClaimState, withdrawMyClaim } from '@/lib/workshops/actions';
import type { ClaimState } from '@/lib/workshops/claims';

type Membership = { authenticated: boolean; member: boolean };

const CONTACT_EMAIL = 'sebastian@campaignplaybook.eu';

// Escape a value for an .ics field (RFC 5545: commas, semicolons, backslashes,
// and newlines must be escaped).
function icsEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// ISO instant → UTC basic format (YYYYMMDDTHHMMSSZ) for .ics DTSTART/DTEND.
function toIcsUtc(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function downloadIcs(event: EventActionsProps['event']) {
  const now = toIcsUtc(new Date().toISOString());
  const uid = `${event.slug}@campaignplaybook.eu`;
  const end = event.endDateTime ?? event.startDateTime;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//european campaign playbook//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toIcsUtc(event.startDateTime)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${icsEscape(event.title)}`,
    `DESCRIPTION:${icsEscape(event.summary)}`,
    `LOCATION:${icsEscape(event.location)}`,
    `URL:https://www.campaignplaybook.eu${routes.event(event.slug)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  // .ics lines are CRLF-delimited.
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.slug}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type EventActionsProps = {
  event: {
    slug: string;
    title: string;
    summary: string;
    location: string;
    startDateTime: string;
    endDateTime?: string;
    registrationUrl?: string;
    offerFreeWorkshop?: boolean;
    waitingListUrl?: string;
    membersOnly: boolean;
    showWaitingList?: boolean;
  };
  hasEnded: boolean;
};

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-[2px] bg-navy px-5 py-3 text-sm font-semibold text-[#EDE7DA] hover:bg-[#0A1D2B]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2';
const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-[2px] border border-rule/30 bg-paper px-5 py-3 text-sm font-medium text-ink/80 hover:bg-ink/[0.03] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2';
const btnDisabled =
  'inline-flex items-center justify-center gap-2 rounded-[2px] border border-rule/20 bg-paper px-5 py-3 text-sm font-medium text-ink/40 cursor-not-allowed';

export default function EventActions({ event, hasEnded }: EventActionsProps) {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [registered, setRegistered] = useState<boolean | null>(null);
  // The meeting link is only ever sent to a registered user by the API, so it
  // isn't present in the page source for anyone who hasn't registered.
  const [joinUrl, setJoinUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [claim, setClaim] = useState<ClaimState | null>(null);
  const [claimNote, setClaimNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/membership')
      .then((r) => (r.ok ? r.json() : { authenticated: false, member: false }))
      .then((data: Membership) => {
        if (cancelled) return;
        setMembership(data);
        // Coming back from signing in to claim: ?claim=1 survived the round
        // trip, so open the box rather than making them find it again.
        if (
          data.authenticated &&
          !data.member &&
          event.membersOnly &&
          event.offerFreeWorkshop !== false &&
          new URLSearchParams(window.location.search).has('claim')
        ) {
          setAsking(true);
        }
      })
      .catch(() => {
        if (!cancelled) setMembership({ authenticated: false, member: false });
      });
    // Registration status, and — only when registered — the gated join link.
    fetch(`/api/events/${encodeURIComponent(event.slug)}/registration`)
      .then((r) => (r.ok ? r.json() : { registered: false }))
      .then((data: { registered?: boolean; joinUrl?: string | null }) => {
        if (!cancelled) {
          setRegistered(Boolean(data.registered));
          setJoinUrl(data.joinUrl ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRegistered(false);
          setJoinUrl(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [event.slug, event.membersOnly, event.offerFreeWorkshop]);

  // Optimistic: flip the UI immediately, run the server action in the
  // background, and revert only if it fails. On success, re-fetch so the
  // now-registered user receives the gated join link.
  function doRegister() {
    setRegistered(true);
    startTransition(async () => {
      try {
        await registerForEvent(event.slug);
        const r = await fetch(`/api/events/${encodeURIComponent(event.slug)}/registration`);
        if (r.ok) {
          const data: { joinUrl?: string | null } = await r.json();
          setJoinUrl(data.joinUrl ?? null);
        }
      } catch {
        setRegistered(false);
      }
    });
  }

  function doCancel() {
    setRegistered(false);
    setJoinUrl(null);
    startTransition(async () => {
      try {
        await cancelRegistration(event.slug);
      } catch {
        setRegistered(true);
      }
    });
  }

  const eventPath = routes.event(event.slug);
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    `Question about ${event.title}`
  )}`;

  // Register button state derives from membership + registration status.
  // Only asked for when it could matter: a signed-in non-member on a
  // members-only workshop. Everyone else never triggers the lookup.
  useEffect(() => {
    if (!event.membersOnly || event.offerFreeWorkshop === false) return;
    if (!membership?.authenticated || membership.member) return;
    let live = true;
    readClaimState(event.slug)
      .then((s) => {
        if (live) setClaim(s);
      })
      .catch(() => {
        if (live) setClaim(null);
      });
    return () => {
      live = false;
    };
  }, [event.membersOnly, event.offerFreeWorkshop, event.slug, membership]);

  function doClaim() {
    startTransition(async () => {
      const res = await claimFreeWorkshop(event.slug, noteText);
      setClaimNote(res.message);
      setAsking(false);
      if (res.ok && res.state) setClaim(res.state);
    });
  }

  function doWithdraw() {
    startTransition(async () => {
      const res = await withdrawMyClaim(event.slug);
      setClaimNote(res.message);
      if (res.ok) setClaim({ kind: 'none', freeWorkshopAvailable: true });
    });
  }

  function claimButton() {
    // Signed out. Rather than a dead end, the offer itself is the reason to
    // make an account, and ?claim=1 brings them back to this box afterwards.
    if (membership && !membership.authenticated) {
      const back = `${eventPath}?claim=1`;
      return (
        <a href={`${routes.login()}?redirectTo=${encodeURIComponent(back)}`} className={btnSecondary}>
          Claim your free workshop
        </a>
      );
    }
    if (claim === null) return null;

    if (claim.kind === 'pending') {
      return (
        <span className={btnDisabled} aria-live="polite">
          {claim.eventSlug === event.slug
            ? 'Free workshop claimed — we’ll confirm shortly'
            : 'Your free workshop claim is being checked'}
        </span>
      );
    }
    if (claim.kind === 'approved') {
      return claim.eventSlug === event.slug ? null : (
        <span className={btnDisabled}>Your free workshop is approved for another date</span>
      );
    }
    if (claim.kind === 'rejected') {
      return <span className={btnDisabled}>We couldn’t offer a free place this time</span>;
    }

    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        disabled={pending}
        className={`${btnSecondary} disabled:opacity-60`}
      >
        Claim your free workshop
      </button>
    );
  }

  function registerButton() {
    if (membership === null || registered === null) {
      return (
        <span className={btnDisabled} aria-live="polite">
          Checking…
        </span>
      );
    }
    if (registered) {
      return (
        <>
          <span
            className="inline-flex items-center gap-2 rounded-[2px] border border-navy/30 bg-navy/[0.04] px-5 py-3 text-sm font-semibold text-ink"
            aria-live="polite"
          >
            <svg className="h-4 w-4 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            You’re registered
          </span>
          {/* Meeting link is revealed only once registered — fetched from the
              server for this user, never embedded in the public page. */}
          {joinUrl && (
            <a href={joinUrl} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
              Join on Zoom
              <span aria-hidden="true">→</span>
            </a>
          )}
          <button
            type="button"
            onClick={doCancel}
            disabled={pending}
            className={`${btnSecondary} disabled:opacity-60`}
          >
            Cancel registration
          </button>
        </>
      );
    }
    if (!membership.authenticated) {
      return (
        <a href={`${routes.login()}?redirectTo=${encodeURIComponent(eventPath)}`} className={btnPrimary}>
          Log in to register
        </a>
      );
    }
    if (event.membersOnly && !membership.member) {
      // A non-member on a members-only workshop. Membership is the main road;
      // the free workshop sits beside it, below, as the way in for someone who
      // has not used theirs.
      return (
        <a href={routes.subscribe()} className={btnPrimary}>
          Become a member to register
        </a>
      );
    }
    // Eligible (member, or any logged-in user for open events) → record the
    // registration via the server action (optimistic).
    return (
      <button type="button" onClick={doRegister} disabled={pending} className={`${btnPrimary} disabled:opacity-60`}>
        Register for this event
      </button>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-8">
      {!hasEnded && registerButton()}

      {/* Where the waiting list used to be. A non-member looking at a
          members-only workshop is exactly the person the free workshop is
          for, so they are offered it rather than told to come back later. */}
      {!hasEnded &&
        event.membersOnly &&
        event.offerFreeWorkshop !== false &&
        membership &&
        !membership.member &&
        !registered &&
        claimButton()}

      <a href={mailto} className={btnSecondary}>
        Got questions? Reach out to us
      </a>

      <button type="button" onClick={() => downloadIcs(event)} className={btnSecondary}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Add to calendar
      </button>
      </div>

      {asking && (
        <div className="-mt-4 mb-8 max-w-xl rounded border border-ink/15 bg-paper/60 p-4">
          <p className="text-sm text-ink/70 mb-3">
            Everyone gets one workshop on the house. Tell me briefly what you are hoping to get out of
            it and I will come back to you, usually the same day. Optional, and it does help.
          </p>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="What are you working on at the moment?"
            className="w-full rounded border border-ink/20 px-3 py-2 text-sm mb-3"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={doClaim} disabled={pending} className={`${btnPrimary} disabled:opacity-60`}>
              Claim my free place
            </button>
            <button type="button" onClick={() => setAsking(false)} className={btnSecondary}>
              Not now
            </button>
          </div>
        </div>
      )}

      {claimNote && (
        <p className="-mt-4 mb-8 text-sm text-ink/70 max-w-xl" aria-live="polite">
          {claimNote}
          {claim?.kind === 'pending' && claim.eventSlug === event.slug && (
            <button type="button" onClick={doWithdraw} disabled={pending} className="ml-2 underline hover:no-underline">
              Withdraw it
            </button>
          )}
        </p>
      )}
    </>
  );
}
