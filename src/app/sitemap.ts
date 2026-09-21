import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { getSitemapData } from '@/lib/content';

// Rebuilt hourly, and whenever the Sanity webhook revalidates a content tag
// (src/app/api/revalidate/route.ts), so lastModified stays current.
export const revalidate = 3600;

// Latest of the given ISO timestamps, or undefined when there are none.
function latest(...stamps: (string | undefined)[]): Date | undefined {
  const times = stamps
    .filter((s): s is string => Boolean(s))
    .map((s) => Date.parse(s))
    .filter((t) => !Number.isNaN(t));
  return times.length ? new Date(Math.max(...times)) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const d = await getSitemapData();
  const stamps = (docs: { updatedAt: string }[]) => docs.map((doc) => doc.updatedAt);

  const articles = stamps(d.articles);
  const taxonomy = [...stamps(d.pillars), ...stamps(d.taxonomy)];
  const trends = stamps(d.trends);
  const authors = stamps(d.authors);
  const bootcampSlugs = new Set(d.bootcamps.flatMap((b) => b.episodes ?? []));
  const articlesWhere = (keep: (a: (typeof d.articles)[number]) => boolean) =>
    d.articles.filter(keep).map((a) => a.updatedAt);

  const entry = (path: string, lastModified?: Date): MetadataRoute.Sitemap[number] =>
    lastModified ? { url: `${SITE_URL}${path}`, lastModified } : { url: `${SITE_URL}${path}` };

  return [
    // Listing pages change whenever something they show changes.
    entry('', latest(...articles, ...authors, ...taxonomy, ...trends)),
    entry('/articles', latest(...articles, ...authors, ...taxonomy)),
    entry('/taxonomy', latest(...taxonomy, ...trends, ...articles)),
    entry('/trends', latest(...trends, ...articlesWhere((a) => Boolean(a.trends?.length)))),
    entry('/events', latest(...stamps(d.events))),
    // Written in code, but its "next sessions" come from the event data
    entry('/ai-workshops-brussels', latest(...stamps(d.events))),
    entry('/contributors', latest(...authors)),
    entry('/digital-bootcamp', latest(...stamps(d.bootcamps), ...articlesWhere((a) => bootcampSlugs.has(a.slug)))),
    entry('/prompt-library', latest(...stamps(d.bootcamps), ...articlesWhere((a) => bootcampSlugs.has(a.slug)))),
    // Pages written in code carry no date: search engines only trust
    // lastModified when it is accurate, and there is no content edit to date.
    ...['/playbook', '/ai-insights', '/consultancy', '/community', '/subscribe', '/privacy', '/cookies'].map((p) =>
      entry(p)
    ),
    ...d.events.map((e) => entry(`/events/${e.slug}`, latest(e.updatedAt))),
    ...d.articles.map((a) => entry(`/articles/${a.slug}`, latest(a.updatedAt))),
    ...d.trends.map((t) =>
      entry(`/trends/${t.slug}`, latest(t.updatedAt, ...articlesWhere((a) => Boolean(a.trends?.includes(t.id)))))
    ),
    ...d.pillars.map((p) =>
      entry(
        `/taxonomy/${p.slug}`,
        latest(
          p.updatedAt,
          ...d.taxonomy.filter((x) => x.pillar === p.slug).map((x) => x.updatedAt),
          ...articlesWhere((a) => a.pillar === p.slug)
        )
      )
    ),
    ...d.authors.map((a) =>
      entry(`/authors/${a.slug}`, latest(a.updatedAt, ...articlesWhere((x) => x.author === a.slug)))
    ),
  ];
}
