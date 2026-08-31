import type { Metadata } from 'next';
import Container from '@/components/Container';
import AiPulseBoard from '@/components/AiPulseBoard';
import PostTrainingFeedback from '@/components/PostTrainingFeedback';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'AI insights',
  description:
    'An anonymous picture of how policy, public affairs and campaign professionals use AI before our workshops, plus what they say after. See if the room looks like you.',
  alternates: { canonical: routes.aiInsights() },
  openGraph: {
    title: 'AI insights — before and after the workshop',
    description:
      'How policy, public affairs and campaign professionals use AI before our workshops, and what they say after.',
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
              days but sure they should be getting more from it. Below, what people like you told us
              anonymously <strong className="text-ink font-semibold">before</strong> the training, and
              what they said, by name, <strong className="text-ink font-semibold">after</strong>.
            </p>
          </div>
        </Container>
      </section>

      {/* Anonymous pre-workshop survey — full-width dark band */}
      <AiPulseBoard />

      {/* Named post-workshop feedback */}
      <PostTrainingFeedback />
    </div>
  );
}
