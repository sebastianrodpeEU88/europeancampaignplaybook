import type { Metadata } from 'next';
import Container from '@/components/Container';
import AiPulseBoard from '@/components/AiPulseBoard';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'AI insights',
  description:
    'A live, anonymous picture of how policy, public affairs and campaign professionals actually use AI, drawn from our workshop participant surveys. See if the room looks like you.',
  alternates: { canonical: routes.aiInsights() },
  openGraph: {
    title: 'AI insights — live from the room',
    description:
      'How policy, public affairs and campaign professionals actually use AI, from our workshop surveys.',
    type: 'article',
    images: [
      {
        url: '/workshops-poster-landscape.png',
        width: 1536,
        height: 1024,
        alt: 'european campaign playbook AI workshops',
      },
    ],
  },
};

export default function AiInsightsPage() {
  return (
    <div className="bg-paper">
      {/* Short preface — the persona mirror, kept tight so the live board sits high */}
      <section className="pt-10 pb-6 sm:pt-14 sm:pb-8">
        <Container>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#dd3c13] mb-3">
              is this you?
            </p>
            <h1 className="display text-3xl sm:text-4xl text-ink leading-tight mb-4">
              the people who take our AI workshops
            </h1>
            <p className="text-ink/75 leading-relaxed text-lg max-w-2xl">
              Communicators, advocates and campaigners working on Europe, already using ChatGPT most
              days but sure they should be getting more from it. Here is what people like you actually
              told us, anonymously, updating as the answers come in.
            </p>
          </div>
        </Container>
      </section>

      {/* Live insights board — full-width dark band */}
      <AiPulseBoard />
    </div>
  );
}
