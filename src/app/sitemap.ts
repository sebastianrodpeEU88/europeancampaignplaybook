import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import {
  getAllEvents,
  getAllArticleSummaries,
  getAllTrends,
  getAllPillars,
  getAllAuthors,
} from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPaths = [
    '',
    '/playbook',
    '/taxonomy',
    '/articles',
    '/contributors',
    '/events',
    '/ai-insights',
    '/consultancy',
    '/community',
    '/subscribe',
    '/trends',
    '/privacy',
    '/cookies',
  ];

  const [events, articles, trends, pillars, authors] = await Promise.all([
    getAllEvents(),
    getAllArticleSummaries(),
    getAllTrends(),
    getAllPillars(),
    getAllAuthors(),
  ]);

  const entries: MetadataRoute.Sitemap = [
    ...staticPaths.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now })),
    ...events.map((e) => ({ url: `${SITE_URL}/events/${e.slug}`, lastModified: now })),
    ...articles.map((a) => ({ url: `${SITE_URL}/articles/${a.slug}`, lastModified: now })),
    ...trends.map((t) => ({ url: `${SITE_URL}/trends/${t.slug}`, lastModified: now })),
    ...pillars.map((p) => ({ url: `${SITE_URL}/taxonomy/${p.slug}`, lastModified: now })),
    ...authors.map((a) => ({ url: `${SITE_URL}/authors/${a.slug}`, lastModified: now })),
  ];

  return entries;
}
