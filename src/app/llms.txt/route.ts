import { ORG_DESCRIPTION, ORG_NAME, SITE_URL } from '@/lib/seo';
import {
  getAllArticleSummaries,
  getAllBootcamps,
  getAllPillars,
  getAllTrends,
  getUpcomingEvents,
} from '@/lib/content';
import { routes } from '@/lib/routes';
import type { Event } from '@/types/content';

// A plain-text guide to the site for AI assistants and answer engines
// (llmstxt.org). Built from the same Sanity content as the pages; rebuilt
// hourly and whenever the webhook revalidates a content tag.
export const revalidate = 3600;

const url = (path: string) => `${SITE_URL}${path}`;
const clean = (text?: string) => (text ?? '').replace(/\s+/g, ' ').trim();
const link = (title: string, path: string, note?: string) =>
  `- [${clean(title)}](${url(path)})${clean(note) ? `: ${clean(note)}` : ''}`;

const dayFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Brussels',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const timeFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Brussels',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function describeEvent(e: Event): string {
  const start = new Date(e.startDateTime);
  const time = e.endDateTime
    ? `${timeFmt.format(start)}–${timeFmt.format(new Date(e.endDateTime))}`
    : timeFmt.format(start);
  const where = e.format === 'Online' ? e.location : `${e.format}, ${e.location}`;
  const access = e.membersOnly ? 'Included with membership.' : 'Free to join.';
  return `${dayFmt.format(start)}, ${time} Brussels time. ${where}. ${access} ${clean(e.summary)}`;
}

export async function GET() {
  const [events, bootcamps, articles, trends, pillars] = await Promise.all([
    getUpcomingEvents(),
    getAllBootcamps(),
    getAllArticleSummaries(),
    getAllTrends(),
    getAllPillars(),
  ]);

  const lines = [
    `# ${ORG_NAME}`,
    '',
    `> ${ORG_DESCRIPTION}`,
    '',
    `Everything below links to ${SITE_URL}. Workshop dates, formats and locations are taken from the live event pages.`,
    '',
    '## Workshops',
    link('All workshops', routes.events(), 'upcoming and past sessions, with registration'),
    link(
      'AI workshops for public affairs, advocacy, consulting and communications in Brussels',
      routes.aiWorkshopsBrussels(),
      'what each workshop covers: Level 1 fundamentals and AI agents, Level 2 advanced agents and automation, Level 3 writing your AI usage policy, and AI for creatives and social media teams'
    ),
    ...(events.length
      ? events.map((e) => link(e.title, routes.event(e.slug), describeEvent(e)))
      : ['- No sessions are scheduled right now.']),
    '',
    '## Digital bootcamp',
    ...bootcamps.flatMap((b) => [
      link(b.title, routes.digitalBootcamp(), `${b.status}. ${b.summary} Free with an account.`),
      ...b.episodes.map((ep) => link(ep.title, routes.article(ep.slug), ep.subheadline)),
    ]),
    link('The AI prompt library', routes.promptLibrary(), 'every prompt from the bootcamp, grouped by the job you are doing. Free with an account.'),
    '',
    '## Articles',
    link('All articles', routes.articles()),
    ...articles.map((a) => link(a.title, routes.article(a.slug), a.subheadline)),
    '',
    '## Trends',
    link('All trends', routes.trends()),
    ...trends.map((t) => link(t.title, routes.trend(t.slug), t.description)),
    '',
    '## Knowledge library',
    link('The playbook', routes.playbook()),
    link('Knowledge taxonomy', routes.taxonomy(), `${pillars.length} pillars, each broken down into branches and topics`),
    ...pillars.map((p) => link(p.title, routes.pillar(p.slug), p.description)),
    '',
    '## Optional',
    link('AI insights', routes.aiInsights()),
    link('Consultancy and advice', routes.consultancy()),
    link('Community', routes.community()),
    link('Contributors', routes.contributors()),
    link('Membership', routes.subscribe()),
    link('Newsletter', routes.newsletter()),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
