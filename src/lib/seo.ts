import type { Event } from '@/types/content';

// Canonical site origin (no trailing slash). Set NEXT_PUBLIC_SITE_URL in the
// env to the production domain; falls back to the Vercel URL.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://europeancampaignplaybook.vercel.app'
).replace(/\/$/, '');

const SAME_AS = [
  'https://www.linkedin.com/company/europeancampaignplaybook/',
  'https://x.com/c_playbook_eu',
  'https://bsky.app/profile/campaignplaybook.bsky.social',
  'https://www.facebook.com/campaignplaybook.eu/',
  'https://www.instagram.com/campaignplaybook.eu/',
];

const ORG_NAME = 'european campaign playbook';

// Sitewide organisation entity — tells search + AI engines who we are, where we
// operate, and what we specialise in.
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: ORG_NAME,
    alternateName: 'ECP',
    url: SITE_URL,
    description:
      'Practitioner-led workshops and knowledge on AI, social media, and policy communications for campaigners and public affairs teams, in Brussels and online.',
    areaServed: ['Brussels', 'Belgium', 'European Union'],
    knowsAbout: [
      'Artificial intelligence for advocacy',
      'Social media campaigning',
      'Policy communications',
      'EU public affairs',
      'Political campaigning',
    ],
    sameAs: SAME_AS,
  };
}

// Per-event entity — the key to event rich results (date, location = Brussels
// or Online, organiser, and a free offer for open sessions).
export function eventLd(event: Event) {
  const url = `${SITE_URL}/events/${event.slug}`;
  const online = event.format === 'Online';
  const hybrid = event.format === 'Hybrid';

  const place = {
    '@type': 'Place',
    name: 'Brussels, Belgium',
    address: { '@type': 'PostalAddress', addressLocality: 'Brussels', addressCountry: 'BE' },
  };
  const virtual = { '@type': 'VirtualLocation', url };
  const location = online ? virtual : hybrid ? [place, virtual] : place;
  const attendanceMode = online
    ? 'OnlineEventAttendanceMode'
    : hybrid
      ? 'MixedEventAttendanceMode'
      : 'OfflineEventAttendanceMode';

  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'EducationEvent',
    name: event.title,
    description: event.summary,
    startDate: event.startDateTime,
    ...(event.endDateTime ? { endDate: event.endDateTime } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: `https://schema.org/${attendanceMode}`,
    location,
    organizer: { '@type': 'Organization', name: ORG_NAME, url: SITE_URL },
    url,
    image: [`${SITE_URL}/workshops-poster.png`],
    inLanguage: 'en',
  };
  // Open (non-members-only) sessions are free — a €0 offer helps them surface.
  if (!event.membersOnly) {
    ld.offers = {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url,
    };
  }
  return ld;
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
