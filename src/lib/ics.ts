// Server-side .ics (RFC 5545) builder for event calendar invites — shared by
// the registration confirmation email. (The event page has its own client-side
// copy for the "Add to calendar" download button.)

export type IcsEvent = {
  slug: string;
  title: string;
  summary: string;
  location: string;
  startDateTime: string;
  endDateTime?: string;
};

// Escape a value for an .ics field (commas, semicolons, backslashes, newlines).
function icsEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// ISO instant → UTC basic format (YYYYMMDDTHHMMSSZ).
function toIcsUtc(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function nowStamp(): string {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function buildEventIcs(event: IcsEvent): string {
  const end = event.endDateTime ?? event.startDateTime;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//european campaign playbook//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.slug}@campaignplaybook.eu`,
    `DTSTAMP:${nowStamp()}`,
    `DTSTART:${toIcsUtc(event.startDateTime)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${icsEscape(event.title)}`,
    `DESCRIPTION:${icsEscape(event.summary)}`,
    `LOCATION:${icsEscape(event.location)}`,
    `URL:https://europeancampaignplaybook.vercel.app/events/${event.slug}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

// A METHOD:CANCEL invite with the same UID — calendar apps that support it will
// remove the previously-added event.
export function buildEventCancelIcs(event: IcsEvent): string {
  const end = event.endDateTime ?? event.startDateTime;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//european campaign playbook//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:CANCEL',
    'BEGIN:VEVENT',
    `UID:${event.slug}@campaignplaybook.eu`,
    `DTSTAMP:${nowStamp()}`,
    'SEQUENCE:1',
    'STATUS:CANCELLED',
    `DTSTART:${toIcsUtc(event.startDateTime)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${icsEscape(event.title)}`,
    `LOCATION:${icsEscape(event.location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}
