import Link from 'next/link';
import { getAllPillars, getAllArticles, getAllAuthors, getPillarForArticle } from '@/lib/content';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import PillarCard from '@/components/PillarCard';
import ArticleCard from '@/components/ArticleCard';
import SubscribeCTA from '@/components/SubscribeCTA';

export default function HomePage() {
  const pillars = getAllPillars();
  const articles = getAllArticles();
  const authors = getAllAuthors();

  const authorMap = new Map(authors.map((a) => [a.id, a]));

  const featuredArticles = articles.filter((a) => !a.locked).slice(0, 3);

  return (
    <div className="bg-[#F8F7F3]">
      {/* Hero */}
      <section className="py-20 sm:py-28 border-b border-[rgba(0,0,0,0.06)]">
        <Container>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-4">
              EU-first · Non-partisan · Practitioner-led
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#1C1C1E] leading-tight mb-5">
              The practitioner knowledge library for European campaigning
            </h1>
            <p className="text-lg text-[#6B7280] leading-relaxed mb-8 max-w-2xl">
              Structured, evidenced, compliance-aware knowledge for political campaigning, public
              affairs, and civic engagement — built for EU practitioners, with a rigorous editorial
              standard and a growing community of contributors.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={routes.taxonomy()}
                className="rounded-lg bg-[#1C1C1E] px-6 py-3 text-sm font-semibold text-white hover:bg-[#374151] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#185FA5] focus-visible:ring-offset-2"
              >
                Browse the knowledge library
              </Link>
              <Link
                href={routes.community()}
                className="rounded-lg border border-[rgba(0,0,0,0.15)] bg-white px-6 py-3 text-sm font-semibold text-[#374151] hover:bg-[rgba(0,0,0,0.02)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#185FA5] focus-visible:ring-offset-2"
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
              <h2 id="pillars-heading" className="text-2xl font-bold text-[#1C1C1E] mb-1">
                16 knowledge pillars
              </h2>
              <p className="text-[#6B7280] text-sm">
                Covering every domain of modern political campaigning and public affairs.
              </p>
            </div>
            <Link
              href={routes.taxonomy()}
              className="hidden sm:inline-flex text-sm font-medium text-[#185FA5] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#185FA5] rounded"
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
                <h2 id="featured-heading" className="text-2xl font-bold text-[#1C1C1E] mb-1">
                  Free to read
                </h2>
                <p className="text-[#6B7280] text-sm">
                  A selection of articles available without a membership.
                </p>
              </div>
              <Link
                href={routes.articles()}
                className="hidden sm:inline-flex text-sm font-medium text-[#185FA5] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#185FA5] rounded"
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
                  pillar={getPillarForArticle(article)}
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
