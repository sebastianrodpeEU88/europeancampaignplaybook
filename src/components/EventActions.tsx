'use client';

import { useEffect, useState, useTransition } from 'react';
import { routes } from '@/lib/routes';
import { registerForEvent, cancelRegistration } from '@/lib/event-actions';

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
    `URL:https://europeancampaignplaybook.vercel.app${routes.event(event.slug)}`,
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
    waitingListUrl?: string;
    membersOnly: boolean;
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

  useEffect(() => {
    let cancelled = false;
    fetch('/api/membership')
      .then((r) => (r.ok ? r.json() : { authenticated: false, member: false }))
      .then((data: Membership) => {
        if (!cancelled) setMembership(data);
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
  }, [event.slug]);

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
    <div className="flex flex-wrap gap-3 mb-8">
      {!hasEnded && registerButton()}

      {/* Waiting list only applies to members-only events for non-members;
          on open events everyone logged-in can register directly. */}
      {!hasEnded &&
        event.membersOnly &&
        membership &&
        !membership.member &&
        (event.waitingListUrl ? (
          <a href={event.waitingListUrl} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
            Join the waiting list
          </a>
        ) : (
          <span className={btnDisabled} title="Waiting list link coming soon">
            Waiting list — coming soon
          </span>
        ))}

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
  );
}
