import Link from 'next/link';
import {
  getAllPillars,
  getAllArticleSummaries,
  getAllAuthors,
  getAllTrends,
  getTrendArticleCounts,
} from '@/lib/content';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import PillarCard from '@/components/PillarCard';
import ArticleCard from '@/components/ArticleCard';
import TrendCard from '@/components/TrendCard';
import SubscribeCTA from '@/components/SubscribeCTA';
import HeroPlay from '@/components/brand/HeroPlay';
import FrameworkIcon from '@/components/brand/FrameworkIcon';

const COMPLETE_MOVE = [
  {
    step: 'diagnose' as const,
    number: '01',
    title: 'diagnose',
    description: 'Understand the context, map the terrain, and find the leverage.',
  },
  {
    step: 'decide' as const,
    number: '02',
    title: 'decide',
    description: 'Set the direction, shape the message, and choose the plays.',
  },
  {
    step: 'move' as const,
    number: '03',
    title: 'move',
    description: 'Activate your people, execute the plan, and measure what changed.',
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ deletionRequested?: string }>;
}) {
  const [pillars, articles, authors, trends, trendCounts, { deletionRequested }] = await Promise.all([
    getAllPillars(),
    getAllArticleSummaries(),
    getAllAuthors(),
    getAllTrends(),
    getTrendArticleCounts(),
    searchParams,
  ]);

  const authorMap = new Map(authors.map((a) => [a.id, a]));
  const pillarMap = new Map(pillars.map((p) => [p.slug, p]));

  const featuredArticles = articles.filter((a) => !a.locked).slice(0, 3);
  const featuredTrends = trends.filter((t) => !t.isFundamentals).slice(0, 3);
  const trendYear = featuredTrends[0]?.year;

  return (
    <div className="bg-paper">
      {deletionRequested && (
        <div className="bg-navy text-[#EDE7DA] text-sm text-center py-3 px-4">
          Your account has been locked and your deletion request received. We&apos;ll complete
          removal of your personal data once required billing records have been retained for the
          legally mandated period.
        </div>
      )}
      {/* Hero */}
      <section className="py-20 sm:py-28 bg-navy overflow-hidden">
        <Container>
          <div className="lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#EDE7DA]/60 mb-4">
                EU-first · non-partisan · practitioner-led
              </p>
              <h1 className="display text-[#EDE7DA] text-4xl sm:text-5xl mb-5">
                campaign knowledge, built to move.
              </h1>
              <p className="text-lg text-[#EDE7DA]/75 leading-relaxed mb-8 max-w-2xl">
                Practitioner-led, EU-first knowledge for political campaigning, public affairs, and
                civic engagement — structured, evidenced, and compliance-aware.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={routes.taxonomy()}
                  className="rounded-[2px] bg-paper px-6 py-3 text-sm font-semibold text-navy hover:bg-[#EDE7DA]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
                >
                  Browse the knowledge library
                </Link>
                <Link
                  href={routes.community()}
                  className="rounded-[2px] border border-[#EDE7DA]/30 bg-transparent px-6 py-3 text-sm font-semibold text-[#EDE7DA] hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
                >
                  Join the community
                </Link>
              </div>
            </div>
            <HeroPlay
              className="hidden lg:block w-64 xl:w-80 flex-shrink-0"
              title="A campaign play resolving into forward momentum"
            />
          </div>
        </Container>
      </section>

      {/* Trends — surfaced first, right under the hero */}
      {featuredTrends.length > 0 && (
        <section className="py-16 border-b border-rule/15" aria-labelledby="trends-heading">
          <Container>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 id="trends-heading" className="display text-2xl text-ink mb-1">
                  {trendYear ? `${trendYear} trends` : 'trends'}
                </h2>
                <p className="text-ink/60 text-sm">
                  What our community of EU campaign practitioners is watching this year.
                </p>
              </div>
              <Link
                href={routes.trends()}
                className="hidden sm:inline-flex text-sm font-medium text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
              >
                All trends →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featuredTrends.map((trend) => (
                <div key={trend.id} className="reveal">
                  <TrendCard trend={trend} articleCount={trendCounts.get(trend.id) ?? 0} />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* The complete move */}
      <section className="py-16 border-b border-rule/15" aria-labelledby="method-heading">
        <Container>
          <h2 id="method-heading" className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-8">
            the complete move
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {COMPLETE_MOVE.map((item) => (
              <div key={item.step} className="reveal">
                <FrameworkIcon step={item.step} className="h-10 w-10 text-ink mb-4" />
                <p className="text-xs text-ink/45 mb-1">{item.number}</p>
                <p className="display text-xl text-ink mb-2">{item.title}</p>
                <p className="text-sm text-ink/60 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Pillars */}
      <section className="py-16" aria-labelledby="pillars-heading">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 id="pillars-heading" className="display text-2xl text-ink mb-1">
                16 knowledge pillars
              </h2>
              <p className="text-ink/60 text-sm">
                Covering every domain of modern political campaigning and public affairs.
              </p>
            </div>
            <Link
              href={routes.taxonomy()}
              className="hidden sm:inline-flex text-sm font-medium text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
            >
              View full taxonomy →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pillars.map((pillar) => (
              <div key={pillar.slug} className="reveal">
                <PillarCard pillar={pillar} />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured articles */}
      {featuredArticles.length > 0 && (
        <section className="py-16 border-t border-rule/15" aria-labelledby="featured-heading">
          <Container>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 id="featured-heading" className="display text-2xl text-ink mb-1">
                  free to read
                </h2>
                <p className="text-ink/60 text-sm">
                  A selection of articles available without a membership.
                </p>
              </div>
              <Link
                href={routes.articles()}
                className="hidden sm:inline-flex text-sm font-medium text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
              >
                All articles →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredArticles.map((article) => (
                <div key={article.id} className="reveal">
                  <ArticleCard
                    article={article}
                    author={authorMap.get(article.authorId)}
                    pillar={pillarMap.get(article.pillarSlug)}
                  />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Subscribe CTA */}
      <section className="py-8">
        <Container>
          <SubscribeCTA />
        </Container>
      </section>
    </div>
  );
}
