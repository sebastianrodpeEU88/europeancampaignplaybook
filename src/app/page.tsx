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

// The four pillars of the campaignPro experience — mirrors the community page,
// condensed for the homepage's measured voice.
const COMMUNITY_VALUES = [
  {
    title: 'Strategic training hub',
    body: 'The smartest tactics to shape public debate, and to sharpen your craft as you go.',
  },
  {
    title: 'Live workshops with experts',
    body: 'Persuasion, digital tools, and media impact, taught by practitioners who’ve done the work.',
  },
  {
    title: 'Personalised learning paths',
    body: 'Tailored insights and mentoring built around your goals, not a generic curriculum.',
  },
  {
    title: 'Networking that works',
    body: 'The right peers and allies to campaign alongside, in Brussels and beyond.',
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
      {/* Hero — brand orange (#dd3c13) with cream text */}
      <section className="py-20 sm:py-28 bg-[#dd3c13] overflow-hidden">
        <Container>
          <div className="lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#EDE7DA]/75 mb-4">
                non-partisan · practitioner-led · EU-first
              </p>
              <h1 className="display text-[#EDE7DA] text-4xl sm:text-5xl mb-3">
                together, we’re writing the playbook for winning campaigns.
              </h1>
              <p className="display text-xl sm:text-2xl text-[#EDE7DA]/90 mb-5">
                a playbook written by, and for, pro-Europeans.
              </p>
              <p className="text-lg text-[#EDE7DA]/90 leading-relaxed mb-8 max-w-2xl">
                european campaign playbook is a community of pro-European communicators who are
                learning together to shift the narrative with better stories, sharper strategy, and
                modern influence tactics. Because when skilled pro-European voices go quiet, the
                loudest and simplest messages win.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={routes.taxonomy()}
                  className="rounded-[2px] bg-paper px-6 py-3 text-sm font-semibold text-navy hover:bg-[#EDE7DA]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#dd3c13]"
                >
                  Browse the knowledge library
                </Link>
                <Link
                  href={routes.community()}
                  className="rounded-[2px] border border-[#EDE7DA]/40 bg-transparent px-6 py-3 text-sm font-semibold text-[#EDE7DA] hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#dd3c13]"
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

      {/* Workshops in Brussels — keyword-aligned, links to the workshops page */}
      <section className="py-16 border-t border-rule/15" aria-labelledby="workshops-heading">
        <Container>
          <div className="max-w-2xl">
            <h2 id="workshops-heading" className="display text-2xl text-ink mb-3">
              workshops in Brussels and online
            </h2>
            <p className="text-ink/70 leading-relaxed mb-6">
              Hands-on workshops on AI for advocacy, social media and creative campaigning, and policy
              communications, built for campaigners and public affairs teams. In Brussels and online,
              with free live info sessions to start.
            </p>
            <Link
              href={routes.events()}
              className="inline-flex rounded-[2px] bg-[#dd3c13] px-5 py-2.5 text-sm font-semibold text-[#EDE7DA] hover:bg-[#dd3c13]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2"
            >
              See the workshops
            </Link>
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

      {/* Community — what it is and why it matters */}
      <section className="py-16 border-t border-rule/15" aria-labelledby="community-heading">
        <Container>
          <div className="max-w-2xl mb-8">
            <h2 id="community-heading" className="display text-2xl text-ink mb-3">
              more than a knowledge library
            </h2>
            <p className="text-ink/70 leading-relaxed">
              Membership is more than the library. It plugs you into a working community, with the
              workshops, the mentoring, and the peers to sharpen your craft and grow your career.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMMUNITY_VALUES.map((value) => (
              <div key={value.title} className="reveal rounded-[2px] border border-rule/20 p-5">
                <h3 className="font-semibold text-ink mb-1.5">{value.title}</h3>
                <p className="text-sm text-ink/65 leading-relaxed">{value.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={routes.community()}
              className="rounded-[2px] bg-[#dd3c13] px-5 py-2.5 text-sm font-semibold text-[#EDE7DA] hover:bg-[#dd3c13]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2"
            >
              Explore the community
            </Link>
            <Link
              href={routes.subscribe()}
              className="text-sm font-medium text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
            >
              See membership options →
            </Link>
          </div>
        </Container>
      </section>

      {/* Subscribe CTA */}
      <section className="py-8">
        <Container>
          <SubscribeCTA variant="orange" />
        </Container>
      </section>
    </div>
  );
}
