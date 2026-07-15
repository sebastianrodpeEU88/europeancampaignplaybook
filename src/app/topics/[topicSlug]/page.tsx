import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllTopics, getTopicBySlug, getArticlesByTopic, getAllAuthors, getPillarBySlug, getAllPillars } from '@/lib/content';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import ArticleCard from '@/components/ArticleCard';
import SidebarTaxonomy from '@/components/SidebarTaxonomy';
import { seriesHex } from '@/lib/pillarSeries';

export async function generateStaticParams() {
  const topics = await getAllTopics();
  return topics.map((t) => ({ topicSlug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}): Promise<Metadata> {
  const { topicSlug } = await params;
  const topic = await getTopicBySlug(topicSlug);
  if (!topic) return {};
  return {
    title: topic.title,
    description: topic.description,
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const topic = await getTopicBySlug(topicSlug);
  if (!topic) notFound();

  const [pillar, articles, allPillars, authors] = await Promise.all([
    getPillarBySlug(topic.pillarSlug),
    getArticlesByTopic(topicSlug),
    getAllPillars(),
    getAllAuthors(),
  ]);
  const authorMap = new Map(authors.map((a) => [a.id, a]));
  const accent = pillar ? seriesHex(pillar.slug) : null;

  const breadcrumbs = [
    { label: 'Knowledge library', href: routes.taxonomy() },
    ...(pillar ? [{ label: pillar.title, href: routes.pillar(pillar.slug) }] : []),
    { label: topic.title, href: routes.topic(topicSlug) },
  ];

  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-10">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <SidebarTaxonomy variant="global" pillars={allPillars} currentTopicSlug={topicSlug} />
          </aside>

          {/* Main */}
          <div>
            <Breadcrumbs items={breadcrumbs} />

            {/* Topic header */}
            <div
              className="rounded-[2px] bg-paper border border-rule/20 p-8 mb-10"
              style={accent ? { borderLeft: `6px solid ${accent}` } : undefined}
            >
              <h1 className="display text-3xl text-ink mb-3">{topic.title}</h1>
              <p className="text-ink/60 leading-relaxed">{topic.description}</p>
            </div>

            {/* Articles */}
            {articles.length === 0 ? (
              <div className="rounded-[2px] border border-rule/20 bg-paper p-12 text-center">
                <p className="text-ink/60 mb-1">No articles yet for this topic.</p>
                <p className="text-sm text-ink/45">Check back soon — the library is growing.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    author={authorMap.get(article.authorId)}
                    pillar={pillar}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
