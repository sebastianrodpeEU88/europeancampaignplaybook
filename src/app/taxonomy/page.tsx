import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPillars, getAllTrends, getTrendArticleCounts } from '@/lib/content';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import PillarCard from '@/components/PillarCard';
import TrendCard from '@/components/TrendCard';

export const metadata: Metadata = {
  title: 'Knowledge Taxonomy',
  description: 'Browse all 16 knowledge pillars covering political campaigning, public affairs, EU compliance, and civic engagement — led by this year’s community trends.',
};

export default async function TaxonomyPage() {
  const [pillars, trends, trendCounts] = await Promise.all([
    getAllPillars(),
    getAllTrends(),
    getTrendArticleCounts(),
  ]);
  const numberedTrends = trends.filter((t) => !t.isFundamentals);
  const year = numberedTrends[0]?.year;

  return (
    <div className="bg-[#FDF6EC] min-h-screen py-12">
      <Container>
        {numberedTrends.length > 0 && (
          <section aria-labelledby="trends-heading" className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="trends-heading" className="text-xl font-bold text-[#2B0A2E] mb-1">
                  {year ? `${year} Trends` : 'This year’s trends'}
                </h2>
                <p className="text-sm text-[#7A6380]">
                  What our community is actually seeing on the ground — the fastest way in.
                </p>
              </div>
              <Link
                href={routes.trends()}
                className="hidden sm:inline-flex text-sm font-medium text-[#FF5B35] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] rounded"
              >
                View all trends →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {numberedTrends.map((trend) => (
                <TrendCard key={trend.id} trend={trend} articleCount={trendCounts.get(trend.id) ?? 0} />
              ))}
            </div>
          </section>
        )}

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#2B0A2E] mb-2">Knowledge taxonomy</h1>
          <p className="text-[#7A6380] max-w-2xl leading-relaxed">
            The Campaign Intelligence Library is organised into 16 knowledge pillars, each covering
            a domain of political campaigning, public affairs, or civic engagement. Each pillar is
            divided into branches and topics, with practitioner articles at every level.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pillars.map((pillar) => (
            <PillarCard key={pillar.slug} pillar={pillar} />
          ))}
        </div>
      </Container>
    </div>
  );
}
