import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllTrends, getTrendBySlug, getArticlesByTrend, getAllAuthors, getAllPillars } from '@/lib/content';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import ArticleCard from '@/components/ArticleCard';

export async function generateStaticParams() {
  const trends = await getAllTrends();
  return trends.map((t) => ({ trendSlug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trendSlug: string }>;
}): Promise<Metadata> {
  const { trendSlug } = await params;
  const trend = await getTrendBySlug(trendSlug);
  if (!trend) return {};
  return {
    title: trend.title,
    description: trend.description || trend.title,
  };
}

export default async function TrendPage({
  params,
}: {
  params: Promise<{ trendSlug: string }>;
}) {
  const { trendSlug } = await params;
  const trend = await getTrendBySlug(trendSlug);
  if (!trend) notFound();

  const [articles, authors, pillars] = await Promise.all([
    getArticlesByTrend(trend.id),
    getAllAuthors(),
    getAllPillars(),
  ]);
  const authorMap = new Map(authors.map((a) => [a.id, a]));
  const pillarMap = new Map(pillars.map((p) => [p.slug, p]));

  const breadcrumbs = [
    { label: 'Trends', href: routes.trends() },
    { label: trend.title, href: routes.trend(trend.slug) },
  ];

  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <Breadcrumbs items={breadcrumbs} />

        <div className="rounded-[2px] bg-navy p-8 mb-10">
          {!trend.isFundamentals && (
            <p className="text-3xl font-bold text-[#EDE7DA] mb-3">#{trend.number}</p>
          )}
          <h1 className="display text-3xl text-[#EDE7DA] leading-tight mb-3">{trend.title}</h1>
          {trend.description && (
            <p className="text-[#EDE7DA]/70 leading-relaxed max-w-2xl">{trend.description}</p>
          )}
        </div>

        {articles.length === 0 ? (
          <div className="rounded-[2px] border border-rule/20 bg-paper p-12 text-center">
            <p className="text-ink/60 mb-1">No articles mapped to this trend yet.</p>
            <p className="text-sm text-ink/45">Check back soon — the library is growing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                author={authorMap.get(article.authorId)}
                pillar={pillarMap.get(article.pillarSlug)}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
