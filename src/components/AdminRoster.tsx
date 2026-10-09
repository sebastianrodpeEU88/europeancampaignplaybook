'use client';

import { useMemo, useState } from 'react';

// One card per session, built from the calendar rather than from the
// registrations, so a workshop nobody has booked is still visible. Two events
// can carry the same title, which is why the date and the slug are always on
// screen, and why the search box exists: "which session is this person on" was
// the question this view was built to answer.

export type RosterPerson = {
  name: string;
  email: string;
  org: string;
  registered: string;
  reminded: boolean;
  attended: boolean;
};

export type RosterEvent = {
  slug: string;
  title: string;
  start: string | null;
  end: string | null;
  location: string;
  format: string;
  membersOnly: boolean;
  hasJoinUrl: boolean;
  sameTitleAsAnother: boolean;
  people: RosterPerson[];
};

const dayFmt = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'Europe/Brussels',
});
const timeFmt = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Brussels',
});

function when(start: string | null, end: string | null): string {
  if (!start) return 'no date';
  const s = new Date(start);
  const tail = end ? ` to ${timeFmt.format(new Date(end))}` : '';
  return `${dayFmt.format(s)} · ${timeFmt.format(s)}${tail}`;
}

const chip = 'text-[11px] px-1.5 py-0.5 rounded';

export default function AdminRoster({ events }: { events: RosterEvent[] }) {
  const [scope, setScope] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [q, setQ] = useState('');

  const now = Date.now();
  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return events
      .filter((e) => {
        const started = e.start ? new Date(e.start).getTime() < now : true;
        if (scope === 'upcoming' && started) return false;
        if (scope === 'past' && !started) return false;
        return true;
      })
      .filter((e) => {
        if (!term) return true;
        if (e.title.toLowerCase().includes(term) || e.slug.toLowerCase().includes(term)) return true;
        return e.people.some(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.email.toLowerCase().includes(term) ||
            p.org.toLowerCase().includes(term)
        );
      });
  }, [events, scope, q, now]);

  const term = q.trim().toLowerCase();
  const totalPeople = visible.reduce((n, e) => n + e.people.length, 0);

  return (
    <div>
      <p className="text-sm text-ink/55 mb-4 max-w-3xl">
        <strong>Every session, and who is on it.</strong> Built from the calendar, so a workshop with
        nobody booked still appears. Search by name, email or organisation to find which session
        somebody is on.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(['upcoming', 'past', 'all'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setScope(s)}
            className={`text-sm px-3 py-1.5 rounded border ${
              scope === s ? 'border-ink bg-ink text-paper' : 'border-ink/20 hover:border-ink/50'
            }`}
          >
            {s}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find a person or a session"
          className="flex-1 min-w-[14rem] border border-ink/20 rounded px-3 py-1.5 text-sm"
        />
        <span className="text-xs text-ink/45">
          {visible.length} sessions · {totalPeople} registrations
        </span>
      </div>

      {visible.length === 0 && (
        <p className="text-sm text-ink/45 border border-dashed border-ink/20 rounded px-3 py-6 text-center">
          Nothing matches.
        </p>
      )}

      <ul className="space-y-3">
        {visible.map((e) => {
          const started = e.start ? new Date(e.start).getTime() < now : true;
          const people = term
            ? e.people.filter(
                (p) =>
                  p.name.toLowerCase().includes(term) ||
                  p.email.toLowerCase().includes(term) ||
                  p.org.toLowerCase().includes(term)
              )
            : e.people;
          const show = people.length > 0 ? people : e.people;
          return (
            <li key={e.slug} className="border border-ink/12 rounded">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2.5 border-b border-ink/10">
                <span className="font-medium text-sm">{e.title}</span>
                <span className="text-sm text-ink/60">{when(e.start, e.end)}</span>
                <span className="text-xs text-ink/40">{e.format || e.location}</span>
                {e.membersOnly && <span className={`${chip} bg-ink/8 text-ink/60`}>members only</span>}
                {!started && !e.hasJoinUrl && (
                  <span className={`${chip} bg-red-100 text-red-900`}>no join link</span>
                )}
                {e.sameTitleAsAnother && (
                  <span className={`${chip} bg-amber-100 text-amber-900`}>duplicate title</span>
                )}
                <span className="ml-auto text-sm font-semibold">
                  {e.people.length}
                  <span className="text-ink/40 font-normal"> registered</span>
                </span>
              </div>

              <div className="px-3 py-1 text-[11px] text-ink/35 border-b border-ink/5">{e.slug}</div>

              {e.people.length === 0 ? (
                <p className="px-3 py-3 text-sm text-ink/40">Nobody registered.</p>
              ) : (
                <ul className="divide-y divide-ink/5">
                  {show.map((p) => (
                    <li
                      key={p.email + p.registered}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-ink/55">{p.email}</span>
                      {p.org && <span className="text-ink/45">{p.org}</span>}
                      <span className="ml-auto flex items-center gap-2">
                        {p.reminded && (
                          <span className={`${chip} bg-ink/8 text-ink/55`}>reminded</span>
                        )}
                        {p.attended && (
                          <span className={`${chip} bg-emerald-100 text-emerald-900`}>attended</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
