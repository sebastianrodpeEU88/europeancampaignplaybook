// Event times are scheduled and authored in Central European Time. Display
// them in Europe/Brussels with an explicit CEST/CET label so every visitor
// sees the intended local-to-the-event time, not their own timezone with no
// indication of which zone it is. (The .ics download uses the absolute UTC
// instant, so calendar apps still convert correctly for each attendee.)
const TZ = 'Europe/Brussels';

function tzAbbrev(date: Date): string {
  const tz =
    new Intl.DateTimeFormat('en-GB', { timeZone: TZ, timeZoneName: 'short' })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName')?.value ?? '';
  if (tz === 'CEST' || tz.includes('+2')) return 'CEST';
  if (tz === 'CET' || tz.includes('+1')) return 'CET';
  return tz;
}

export function formatBrusselsRange(startIso: string, endIso?: string): string {
  const start = new Date(startIso);
  const datePart = start.toLocaleDateString('en-GB', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: TZ,
  });
  const startTime = start.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', timeZone: TZ });
  const label = tzAbbrev(start);
  if (!endIso) return `${datePart} · ${startTime} ${label}`;
  const end = new Date(endIso);
  const endTime = end.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', timeZone: TZ });
  return `${datePart} · ${startTime} – ${endTime} ${label}`;
}

export function formatBrusselsDateTime(iso: string): string {
  const d = new Date(iso);
  const s = d.toLocaleDateString('en-GB', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: TZ,
  });
  return `${s} ${tzAbbrev(d)}`;
}

export function brusselsDayBadge(iso: string): { day: string; month: string } {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString('en-GB', { day: '2-digit', timeZone: TZ }),
    month: d.toLocaleDateString('en-GB', { month: 'short', timeZone: TZ }).toUpperCase(),
  };
}
