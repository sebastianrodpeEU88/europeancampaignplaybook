import type { Metadata } from 'next';
import { getAllPillars } from '@/lib/content';
import Container from '@/components/Container';
import PillarCard from '@/components/PillarCard';

export const metadata: Metadata = {
  title: 'Knowledge Taxonomy',
  description: 'Browse all 16 knowledge pillars covering political campaigning, public affairs, EU compliance, and civic engagement.',
};

export default function TaxonomyPage() {
  const pillars = getAllPillars();

  return (
    <div className="bg-[#F8F7F3] min-h-screen py-12">
      <Container>
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#1C1C1E] mb-2">Knowledge taxonomy</h1>
          <p className="text-[#6B7280] max-w-2xl leading-relaxed">
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
