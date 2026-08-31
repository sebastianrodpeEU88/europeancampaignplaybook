import Link from 'next/link';
import Container from '@/components/Container';
import { routes } from '@/lib/routes';

// Named, attributed feedback left after the workshops (public LinkedIn
// recommendations), shown as the "after" to the board's anonymous "before".
// To add another: drop a new entry at the top of the array.
type Testimonial = { quote: string; name: string; role: string; date: string };

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'I attended the workshop led by Sebastián, which I would for sure recommend. I found his systemic approach to storytelling and narrative very useful for my PA work, and I will certainly use the prompts he shared.',
    name: 'Martin Orešić',
    role: 'Account Director, Hanbury Strategy',
    date: 'Sep 2025',
  },
  {
    quote:
      'What I really appreciated was his practical and engaging approach: combining solid communication theory with real campaign examples, the use of AI as a tool for creativity and strategy, and clear reasoning behind why certain narratives work (or don’t). Very useful and insightful for communication experts in Brussels!',
    name: 'Roberta Fadda',
    role: 'Communication Specialist & Multimedia Producer',
    date: 'Sep 2025',
  },
  {
    quote:
      'One of the most hands-on sessions I’ve joined in a long time. From building your first campaign to diving deep into agents and automation, the day was packed with practical insights. I especially loved the part on creating your own AI agent for policy, comms, or strategy.',
    name: 'Philippe Bossin',
    role: 'Digital Organizer & Strategic Communications',
    date: 'Jul 2025',
  },
  {
    quote:
      'I would highly recommend Sebastián’s training on AI for Advocacy. Very comprehensive, with clear presentations on how AI works, plus tips and tricks on prompts and using ChatGPT for communications campaigns. Thank you for helping comms professionals stay updated!',
    name: 'Barbara Vanotti',
    role: 'Communications Manager, TEPSA',
    date: 'Jun 2024',
  },
  {
    quote:
      'I followed a course on AI for advocacy by Sebastián and I can only comment positively. His sessions were clear, engaging, practical and insightful. The language was adapted and I learned a lot, so thank you for that!',
    name: 'Catarina Moleiro',
    role: 'Policy & Communications Officer, Coimbra Group',
    date: 'May 2024',
  },
  {
    quote:
      'Lo recomiendo sin duda: ofrece herramientas que agilizan y aportan un gran valor añadido al trabajo cotidiano. El contenido es muy dinámico. Mi visión sobre la IA cambió drásticamente. Un acierto cursarlo.',
    name: 'Candela González-Alemán Martínez',
    role: 'Public Affairs, Agrifood & Sustainability',
    date: 'Apr 2024',
  },
  {
    quote:
      'A very comprehensive training on AI tools for public affairs, for those starting to get in contact with this technology. Totally recommended!',
    name: 'Adrian Blazquez',
    role: 'Consultant, Schuman Associates',
    date: 'Apr 2024',
  },
  {
    quote:
      'Very interesting training on Artificial Intelligence, and well managed. Highly recommendable!',
    name: 'César González de Miguel',
    role: 'Director, EFFAB',
    date: 'Apr 2024',
  },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function PostTrainingFeedback() {
  return (
    <section className="py-14 sm:py-20" aria-labelledby="feedback-heading">
      <Container>
        <div className="max-w-3xl mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#dd3c13] mb-3">
            after the workshop
          </p>
          <h2 id="feedback-heading" className="display text-3xl sm:text-4xl text-ink leading-tight mb-4">
            what they say afterwards
          </h2>
          <p className="text-ink/70 leading-relaxed text-lg max-w-2xl">
            The survey above is where people start. This is what they tell us once the training is
            done, in their own names, from their own LinkedIn.
          </p>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="mb-4 break-inside-avoid rounded-[2px] border border-rule/20 bg-paper p-5"
            >
              <blockquote className="text-ink/80 leading-relaxed">“{t.quote}”</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <span
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#dd3c13]/12 text-[#dd3c13] text-xs font-bold"
                  aria-hidden="true"
                >
                  {initials(t.name)}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{t.name}</span>
                  <span className="block text-xs text-ink/55">
                    {t.role} · {t.date}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Final CTA — the survey → feedback → join flow ends here */}
        <div className="mt-12 rounded-[2px] bg-gradient-to-br from-[#dd3c13] to-[#0A1D2B] p-8 sm:p-10 text-center">
          <h2 className="display text-2xl sm:text-3xl text-[#EDE7DA] mb-3">
            move from the survey to the recommendations
          </h2>
          <p className="text-[#EDE7DA]/85 leading-relaxed max-w-xl mx-auto mb-6">
            Hands-on AI workshops for campaigners, public affairs and policy teams, in Brussels and
            online. Come find where your gap is, and close it.
          </p>
          <Link
            href={routes.events()}
            className="inline-flex rounded-[2px] bg-paper px-6 py-3 text-sm font-semibold text-navy hover:bg-[#EDE7DA]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#dd3c13]"
          >
            see the workshops
          </Link>
        </div>
      </Container>
    </section>
  );
}
