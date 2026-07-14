import type { Metadata } from 'next';
import { getAllTrends, getTrendArticleCounts } from '@/lib/content';
import Container from '@/components/Container';
import TrendCard from '@/components/TrendCard';

export const metadata: Metadata = {
  title: 'Trends',
  description: 'The trends our community of EU campaign practitioners is watching this year — and the articles that speak to each one.',
};

export default async function TrendsPage() {
  const [trends, counts] = await Promise.all([getAllTrends(), getTrendArticleCounts()]);
  const numbered = trends.filter((t) => !t.isFundamentals);
  const fundamentals = trends.filter((t) => t.isFundamentals);
  const year = numbered[0]?.year;

  return (
    <div className="bg-[#FDF6EC] min-h-screen py-12">
      <Container>
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#2B0A2E] mb-2">
            {year ? `${year} Trends` : 'Trends'}
          </h1>
          <p className="text-[#7A6380] max-w-2xl leading-relaxed">
            Every year, we collect the trends our community of EU campaign practitioners is
            actually seeing on the ground. Every article in the library is mapped to at least one
            of them, cutting across the knowledge taxonomy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {numbered.map((trend) => (
            <TrendCard key={trend.id} trend={trend} articleCount={counts.get(trend.id) ?? 0} />
          ))}
        </div>

        {fundamentals.length > 0 && (
          <section aria-labelledby="fundamentals-heading">
            <h2 id="fundamentals-heading" className="text-xl font-bold text-[#2B0A2E] mb-1">
              Fundamentals
            </h2>
            <p className="text-sm text-[#7A6380] mb-4 max-w-2xl">
              Evergreen content that doesn’t tie to a specific year’s trends.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fundamentals.map((trend) => (
                <TrendCard key={trend.id} trend={trend} articleCount={counts.get(trend.id) ?? 0} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
