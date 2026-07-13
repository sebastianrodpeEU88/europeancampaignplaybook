import Link from 'next/link';
import { getAllPillars, getAllArticles, getAllAuthors } from '@/lib/content';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import PillarCard from '@/components/PillarCard';
import ArticleCard from '@/components/ArticleCard';
import SubscribeCTA from '@/components/SubscribeCTA';

export default async function HomePage() {
  const [pillars, articles, authors] = await Promise.all([
    getAllPillars(),
    getAllArticles(),
    getAllAuthors(),
  ]);

  const authorMap = new Map(authors.map((a) => [a.id, a]));
  const pillarMap = new Map(pillars.map((p) => [p.slug, p]));

  const featuredArticles = articles.filter((a) => !a.locked).slice(0, 3);

  return (
    <div className="bg-[#FDF6EC]">
      {/* Hero */}
      <section className="py-20 sm:py-28 bg-[#2B0A2E]">
        <Container>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold font-mono uppercase tracking-wider text-[#C9B3CC] mb-4">
              EU-first · Non-partisan · Practitioner-led
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5">
              <span className="text-[#FDF6EC]">The practitioner knowledge library for </span>
              <span className="text-[#C8F169] underline decoration-[#FF5B35] decoration-4 underline-offset-8">
                European campaigning
              </span>
            </h1>
            <p className="text-lg text-[#C9B3CC] leading-relaxed mb-8 max-w-2xl">
              Structured, evidenced, compliance-aware knowledge for political campaigning, public
              affairs, and civic engagement — built for EU practitioners, with a rigorous editorial
              standard and a growing community of contributors.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={routes.taxonomy()}
                className="rounded-lg bg-[#FDF6EC] px-6 py-3 text-sm font-semibold text-[#2B0A2E] hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2B0A2E]"
              >
                Browse the knowledge library
              </Link>
              <Link
                href={routes.community()}
                className="rounded-lg border border-[rgba(253,246,236,0.3)] bg-transparent px-6 py-3 text-sm font-semibold text-[#FDF6EC] hover:bg-[rgba(253,246,236,0.08)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2B0A2E]"
              >
                Join the community
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Pillars */}
      <section className="py-16" aria-labelledby="pillars-heading">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 id="pillars-heading" className="text-2xl font-bold text-[#2B0A2E] mb-1">
                16 knowledge pillars
              </h2>
              <p className="text-[#7A6380] text-sm">
                Covering every domain of modern political campaigning and public affairs.
              </p>
            </div>
            <Link
              href={routes.taxonomy()}
              className="hidden sm:inline-flex text-sm font-medium text-[#FF5B35] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] rounded"
            >
              View full taxonomy →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pillars.map((pillar) => (
              <PillarCard key={pillar.slug} pillar={pillar} />
            ))}
          </div>
        </Container>
      </section>

      {/* Featured articles */}
      {featuredArticles.length > 0 && (
        <section className="py-16 border-t border-[rgba(0,0,0,0.06)]" aria-labelledby="featured-heading">
          <Container>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 id="featured-heading" className="text-2xl font-bold text-[#2B0A2E] mb-1">
                  Free to read
                </h2>
                <p className="text-[#7A6380] text-sm">
                  A selection of articles available without a membership.
                </p>
              </div>
              <Link
                href={routes.articles()}
                className="hidden sm:inline-flex text-sm font-medium text-[#FF5B35] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] rounded"
              >
                All articles →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  author={authorMap.get(article.authorId)}
                  pillar={pillarMap.get(article.pillarSlug)}
                />
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
