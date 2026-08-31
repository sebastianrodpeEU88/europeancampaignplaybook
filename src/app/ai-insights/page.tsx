import type { Metadata } from 'next';
import Link from 'next/link';
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

// "This is you if…" traits, drawn straight from what participants told us in the
// surveys the board below visualises.
const TRAITS = [
  {
    title: 'you work in policy, public affairs or campaigns',
    body: 'Your days run on position papers, briefings, reports, speeches, and keeping partners and members in the loop, in Brussels or across Europe.',
  },
  {
    title: 'you already use ChatGPT, most days',
    body: 'You picked it up yourself and it genuinely speeds you up, but you sense you have plateaued at the chatbot and there is more to reach for.',
  },
  {
    title: 'you often work in a second language',
    body: 'You lean on AI to sharpen the English, smooth the tone, and find answers faster, without losing your own voice.',
  },
  {
    title: 'you are short on time for the work that matters',
    body: 'You wish you had more hours for strategy, new ideas, and reaching the decision-makers, not the admin around them.',
  },
];

export default function AiInsightsPage() {
  return (
    <div className="bg-paper">
      {/* Preface — who's in the room */}
      <section className="py-14 sm:py-20">
        <Container>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#dd3c13] mb-3">
              before you scroll, is this you?
            </p>
            <h1 className="display text-3xl sm:text-4xl text-ink leading-tight mb-5">
              the people who take our AI workshops
            </h1>
            <div className="space-y-4 text-ink/75 leading-relaxed text-lg max-w-2xl">
              <p>
                They are communicators, advocates and campaigners working on Europe, curious about AI,
                clear-eyed about its limits, and quietly convinced they should be getting more out of
                it than they are.
              </p>
              <p>
                Before the live numbers below, here is a quick mirror. If a few of these sound like
                you, the room already looks like you, and so does the workshop.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
            {TRAITS.map((t) => (
              <div key={t.title} className="rounded-[2px] border border-rule/20 bg-paper p-5">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#dd3c13]/12 text-[#dd3c13] text-xs font-bold"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <div>
                    <h2 className="font-semibold text-ink mb-1">{t.title}</h2>
                    <p className="text-sm text-ink/65 leading-relaxed">{t.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-ink/70 leading-relaxed max-w-2xl">
            Sound familiar? Here is what people like you actually told us, updating as the answers
            come in.
          </p>
          <div className="mt-4">
            <Link
              href={routes.events()}
              className="inline-flex rounded-[2px] bg-[#dd3c13] px-5 py-2.5 text-sm font-semibold text-[#EDE7DA] hover:bg-[#dd3c13]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dd3c13] focus-visible:ring-offset-2"
            >
              see the workshops
            </Link>
          </div>
        </Container>
      </section>

      {/* Live insights board — full-width dark band */}
      <AiPulseBoard />
    </div>
  );
}
