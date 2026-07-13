import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllPillars, getPillarBySlug, getArticlesByPillar, getAllAuthors, getTopicArticleCounts } from '@/lib/content';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import TopicCard from '@/components/TopicCard';
import ArticleCard from '@/components/ArticleCard';
import SidebarTaxonomy from '@/components/SidebarTaxonomy';

export async function generateStaticParams() {
  const pillars = await getAllPillars();
  return pillars.map((p) => ({ pillarSlug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillarSlug: string }>;
}): Promise<Metadata> {
  const { pillarSlug } = await params;
  const pillar = await getPillarBySlug(pillarSlug);
  if (!pillar) return {};
  return {
    title: pillar.title,
    description: pillar.description,
  };
}

export default async function PillarPage({
  params,
}: {
  params: Promise<{ pillarSlug: string }>;
}) {
  const { pillarSlug } = await params;
  const pillar = await getPillarBySlug(pillarSlug);
  if (!pillar) notFound();

  const [articles, allPillars, topicArticleCounts, authors] = await Promise.all([
    getArticlesByPillar(pillarSlug),
    getAllPillars(),
    getTopicArticleCounts(),
    getAllAuthors(),
  ]);
  const authorMap = new Map(authors.map((a) => [a.id, a]));

  const breadcrumbs = [
    { label: 'Knowledge library', href: routes.taxonomy() },
    { label: pillar.title, href: routes.pillar(pillarSlug) },
  ];

  return (
    <div className="bg-[#F8F7F3] min-h-screen py-12">
      <Container>
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-10">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <SidebarTaxonomy variant="global" pillars={allPillars} />
          </aside>

          {/* Main */}
          <div>
            <Breadcrumbs items={breadcrumbs} />

            {/* Pillar header */}
            <div
              className="rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] p-8 mb-10"
              style={{ borderLeft: `6px solid ${pillar.accentColour}` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <h1 className="text-3xl font-bold text-[#1C1C1E] leading-tight">
                  {pillar.title}
                </h1>
                {pillar.isNew && (
                  <span
                    className="flex-shrink-0 mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: pillar.accentColour }}
                  >
                    New
                  </span>
                )}
              </div>
              <p className="text-[#6B7280] leading-relaxed">{pillar.description}</p>
            </div>

            {/* Branches and topics */}
            {pillar.branches.map((branch) => (
              <section key={branch.slug} className="mb-10" aria-labelledby={`branch-${branch.slug}`}>
                <h2
                  id={`branch-${branch.slug}`}
                  className="text-lg font-semibold text-[#1C1C1E] mb-1"
                >
                  {branch.title}
                </h2>
                <p className="text-sm text-[#6B7280] mb-4">{branch.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {branch.topics.map((topic) => (
                    <TopicCard
                      key={topic.slug}
                      topic={topic}
                      pillar={pillar}
                      articleCount={topicArticleCounts.get(topic.slug) ?? 0}
                    />
                  ))}
                </div>
              </section>
            ))}

            {/* Articles in this pillar */}
            {articles.length > 0 && (
              <section aria-labelledby="pillar-articles-heading" className="mt-8 border-t border-[rgba(0,0,0,0.06)] pt-8">
                <h2 id="pillar-articles-heading" className="text-xl font-bold text-[#1C1C1E] mb-6">
                  Articles in this pillar
                </h2>
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
              </section>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
