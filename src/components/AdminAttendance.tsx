'use client';

import { useMemo, useState, useTransition } from 'react';
import { setAttendance, setFreeWorkshop } from '@/lib/crm/actions';

// Who actually turned up. The site records registrations; this is where the
// register gets marked, and where a workshop is recorded as somebody's free
// one. Both feed the funnel: attendance moves a contact forward, a booking
// that passed with nobody ticked moves it to a no-show.

export type AttendanceRegistration = {
  userId: string;
  contactId: string | null;
  name: string;
  email: string;
  attended: boolean;
  freeWorkshopEvent: string | null;
};

export type AttendanceEvent = {
  slug: string;
  title: string;
  start: string | null;
  kind: 'info_session' | 'workshop' | 'other';
  registrations: AttendanceRegistration[];
};

function dateLabel(value: string | null): string {
  if (!value) return 'no date';
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminAttendance({ events }: { events: AttendanceEvent[] }) {
  const [open, setOpen] = useState<string | null>(events[0]?.slug ?? null);
  const [kind, setKind] = useState<'all' | 'info_session' | 'workshop'>('all');
  const [pending, startTransition] = useTransition();

  const visible = useMemo(
    () => events.filter((e) => kind === 'all' || e.kind === kind),
    [events, kind]
  );

  return (
    <section>
      <h2 className="display text-xl text-ink mb-1">attendance</h2>
      <p className="text-sm text-ink/55 mb-4">
        Past events, with everyone who registered. Tick the people who turned up: that moves them
        along the funnel, and leaves the ones who booked and never appeared visible as no-shows. On
        a workshop you can also record it as somebody&apos;s free workshop, so the next time they ask
        you can see it at a glance.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {(
          [
            ['all', 'All events'],
            ['info_session', 'Info sessions'],
            ['workshop', 'Workshops'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setKind(value)}
            className={`rounded-[2px] border px-3 py-1.5 text-sm ${
              kind === value ? 'border-ink bg-ink text-paper' : 'border-rule/30 text-ink/70 hover:border-ink/40'
            }`}
          >
            {label}
          </button>
        ))}
        {pending && <span className="self-center text-sm text-ink/45">saving…</span>}
      </div>

      <div className="space-y-3">
        {visible.map((event) => {
          const attended = event.registrations.filter((r) => r.attended).length;
          const isOpen = open === event.slug;
          return (
            <div key={event.slug} className="rounded-[2px] border border-rule/20">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : event.slug)}
                className="flex w-full items-baseline justify-between gap-4 px-4 py-3 text-left hover:bg-ink/[0.02]"
              >
                <span>
                  <span className="font-medium text-ink">{event.title}</span>
                  <span className="ml-2 text-sm text-ink/50">
                    {dateLabel(event.start)} · {event.kind === 'info_session' ? 'info session' : 'workshop'}
                  </span>
                </span>
                <span className="whitespace-nowrap text-sm text-ink/60">
                  {attended} of {event.registrations.length} attended
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-rule/15 px-4 py-3">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase tracking-wider text-ink/45">
                      <tr>
                        <th className="py-2 font-semibold">Registered</th>
                        <th className="py-2 font-semibold">Turned up</th>
                        {event.kind === 'workshop' && <th className="py-2 font-semibold">Free workshop</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rule/10">
                      {event.registrations.map((r) => (
                        <tr key={r.userId}>
                          <td className="py-2">
                            <span className="text-ink">{r.name}</span>
                            <span className="ml-2 text-ink/50">{r.email}</span>
                          </td>
                          <td className="py-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={r.attended}
                                disabled={pending}
                                onChange={(e) =>
                                  startTransition(async () => {
                                    await setAttendance(r.userId, event.slug, e.target.checked);
                                  })
                                }
                              />
                              <span className="text-ink/60">{r.attended ? 'attended' : 'no record'}</span>
                            </label>
                          </td>
                          {event.kind === 'workshop' && (
                            <td className="py-2">
                              {r.contactId ? (
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={r.freeWorkshopEvent === event.slug}
                                    disabled={pending || (r.freeWorkshopEvent != null && r.freeWorkshopEvent !== event.slug)}
                                    onChange={(e) =>
                                      startTransition(async () => {
                                        await setFreeWorkshop(r.contactId!, e.target.checked ? event.slug : null);
                                      })
                                    }
                                  />
                                  <span className="text-ink/60">
                                    {r.freeWorkshopEvent === event.slug
                                      ? 'this was their free one'
                                      : r.freeWorkshopEvent
                                        ? 'already used elsewhere'
                                        : 'still available'}
                                  </span>
                                </label>
                              ) : (
                                <span className="text-ink/40">—</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
