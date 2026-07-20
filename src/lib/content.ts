import { client } from '@/sanity/client';
import {
  ALL_ARTICLES_QUERY,
  ALL_ARTICLE_SUMMARIES_QUERY,
  ALL_AUTHORS_QUERY,
  ALL_EVENTS_QUERY,
  ALL_TRENDS_QUERY,
  ARTICLE_BY_SLUG_QUERY,
  ARTICLES_BY_BRANCH_QUERY,
  ARTICLES_BY_PILLAR_QUERY,
  ARTICLES_BY_TOPIC_QUERY,
  ARTICLES_BY_TREND_QUERY,
  AUTHOR_BY_ID_QUERY,
  EVENT_BY_SLUG_QUERY,
  PILLARS_QUERY,
  PILLAR_BY_SLUG_QUERY,
  SEARCH_INDEX_QUERY,
  TAGS,
  TOPIC_ARTICLE_COUNTS_QUERY,
  TREND_ARTICLE_COUNTS_QUERY,
  TREND_BY_SLUG_QUERY,
} from '@/sanity/queries';
import type { Article, ArticleSummary, Author, BreadcrumbItem, Event, Pillar, SearchIndex, Topic, Trend } from '@/types/content';
import { routes } from './routes';

// Revalidated on-demand by src/app/api/revalidate/route.ts (Sanity webhook),
// with a one-hour fallback so content still refreshes if a webhook is missed.
const REVALIDATE_SECONDS = 3600;

export async function getAllPillars(): Promise<Pillar[]> {
  return client.fetch(
    PILLARS_QUERY,
    {},
    { next: { tags: [TAGS.pillar, TAGS.branch, TAGS.topic], revalidate: REVALIDATE_SECONDS } }
  );
}

export async function getPillarBySlug(slug: string): Promise<Pillar | undefined> {
  const pillar = await client.fetch(
    PILLAR_BY_SLUG_QUERY,
    { slug },
    { next: { tags: [TAGS.pillar, TAGS.branch, TAGS.topic], revalidate: REVALIDATE_SECONDS } }
  );
  return pillar ?? undefined;
}

export async function getAllTopics(): Promise<Topic[]> {
  const pillars = await getAllPillars();
  return pillars.flatMap((p) => p.branches.flatMap((b) => b.topics));
}

export async function getTopicBySlug(slug: string): Promise<Topic | undefined> {
  const topics = await getAllTopics();
  return topics.find((t) => t.slug === slug);
}

export async function getTopicArticleCounts(): Promise<Map<string, number>> {
  const rows: { slug: string; count: number }[] = await client.fetch(
    TOPIC_ARTICLE_COUNTS_QUERY,
    {},
    { next: { tags: [TAGS.topic, TAGS.article], revalidate: REVALIDATE_SECONDS } }
  );
  return new Map(rows.map((r) => [r.slug, r.count]));
}

export async function getAllArticles(): Promise<Article[]> {
  return client.fetch(ALL_ARTICLES_QUERY, {}, { next: { tags: [TAGS.article], revalidate: REVALIDATE_SECONDS } });
}

// Use for listing/browsing UI (article cards, filters) — see ArticleSummary
// for why this excludes gated fields.
export async function getAllArticleSummaries(): Promise<ArticleSummary[]> {
  return client.fetch(
    ALL_ARTICLE_SUMMARIES_QUERY,
    {},
    { next: { tags: [TAGS.article], revalidate: REVALIDATE_SECONDS } }
  );
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const article = await client.fetch(
    ARTICLE_BY_SLUG_QUERY,
    { slug },
    { next: { tags: [TAGS.article], revalidate: REVALIDATE_SECONDS } }
  );
  return article ?? undefined;
}

export async function getArticlesByPillar(pillarSlug: string): Promise<Article[]> {
  return client.fetch(
    ARTICLES_BY_PILLAR_QUERY,
    { slug: pillarSlug },
    { next: { tags: [TAGS.article], revalidate: REVALIDATE_SECONDS } }
  );
}

export async function getArticlesByTopic(topicSlug: string): Promise<Article[]> {
  return client.fetch(
    ARTICLES_BY_TOPIC_QUERY,
    { slug: topicSlug },
    { next: { tags: [TAGS.article], revalidate: REVALIDATE_SECONDS } }
  );
}

export async function getArticlesByBranch(branchSlug: string): Promise<Article[]> {
  return client.fetch(
    ARTICLES_BY_BRANCH_QUERY,
    { slug: branchSlug },
    { next: { tags: [TAGS.article], revalidate: REVALIDATE_SECONDS } }
  );
}

export async function getAllAuthors(): Promise<Author[]> {
  return client.fetch(ALL_AUTHORS_QUERY, {}, { next: { tags: [TAGS.author], revalidate: REVALIDATE_SECONDS } });
}

export async function getAuthorById(id: string): Promise<Author | undefined> {
  const author = await client.fetch(
    AUTHOR_BY_ID_QUERY,
    { id },
    { next: { tags: [TAGS.author], revalidate: REVALIDATE_SECONDS } }
  );
  return author ?? undefined;
}

export async function getBreadcrumbForArticle(article: Article): Promise<BreadcrumbItem[]> {
  const pillar = await getPillarForArticle(article);
  const branch = pillar?.branches.find((b) => b.slug === article.branchSlug);
  const topic = branch?.topics.find((t) => t.slug === article.topicSlug);

  const crumbs: BreadcrumbItem[] = [
    { label: 'Knowledge library', href: routes.taxonomy() },
  ];

  if (pillar) {
    crumbs.push({ label: pillar.title, href: routes.pillar(pillar.slug) });
  }

  if (topic) {
    crumbs.push({ label: topic.title, href: routes.topic(topic.slug) });
  }

  crumbs.push({ label: article.title, href: routes.article(article.slug) });

  return crumbs;
}

export async function getPillarForArticle(article: Article): Promise<Pillar | undefined> {
  return getPillarBySlug(article.pillarSlug);
}

export async function getAllEvents(): Promise<Event[]> {
  return client.fetch(ALL_EVENTS_QUERY, {}, { next: { tags: [TAGS.event], revalidate: REVALIDATE_SECONDS } });
}

export async function getEventBySlug(slug: string): Promise<Event | undefined> {
  const event = await client.fetch(
    EVENT_BY_SLUG_QUERY,
    { slug },
    { next: { tags: [TAGS.event], revalidate: REVALIDATE_SECONDS } }
  );
  return event ?? undefined;
}

function eventHasEnded(event: Event, now: Date): boolean {
  return new Date(event.endDateTime ?? event.startDateTime) < now;
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const now = new Date();
  const events = await getAllEvents();
  return events
    .filter((e) => !eventHasEnded(e, now))
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
}

export async function getPastEvents(): Promise<Event[]> {
  const now = new Date();
  const events = await getAllEvents();
  return events
    .filter((e) => eventHasEnded(e, now))
    .sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime());
}

export async function getAllTrends(): Promise<Trend[]> {
  return client.fetch(ALL_TRENDS_QUERY, {}, { next: { tags: [TAGS.trend], revalidate: REVALIDATE_SECONDS } });
}

export async function getTrendBySlug(slug: string): Promise<Trend | undefined> {
  const trend = await client.fetch(
    TREND_BY_SLUG_QUERY,
    { slug },
    { next: { tags: [TAGS.trend], revalidate: REVALIDATE_SECONDS } }
  );
  return trend ?? undefined;
}

export async function getArticlesByTrend(trendId: string): Promise<Article[]> {
  return client.fetch(
    ARTICLES_BY_TREND_QUERY,
    { trendId },
    { next: { tags: [TAGS.trend, TAGS.article], revalidate: REVALIDATE_SECONDS } }
  );
}

export async function getTrendArticleCounts(): Promise<Map<string, number>> {
  const rows: { id: string; count: number }[] = await client.fetch(
    TREND_ARTICLE_COUNTS_QUERY,
    {},
    { next: { tags: [TAGS.trend, TAGS.article], revalidate: REVALIDATE_SECONDS } }
  );
  return new Map(rows.map((r) => [r.id, r.count]));
}

export async function getSearchIndex(): Promise<SearchIndex> {
  return client.fetch(
    SEARCH_INDEX_QUERY,
    {},
    {
      next: {
        tags: [TAGS.article, TAGS.topic, TAGS.pillar, TAGS.trend],
        revalidate: REVALIDATE_SECONDS,
      },
    }
  );
}
