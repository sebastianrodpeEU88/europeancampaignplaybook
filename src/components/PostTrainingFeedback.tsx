import Link from 'next/link';
import Container from '@/components/Container';
import TestimonialWall from '@/components/TestimonialWall';
import { routes } from '@/lib/routes';

// The "after" to the board's anonymous "before": named, attributed feedback
// left after the workshops. Anchor id `testimonials` so it can be linked to
// directly (e.g. from event pages).
export default function PostTrainingFeedback() {
  return (
    <section
      id="testimonials"
      className="py-14 sm:py-20 scroll-mt-20"
      aria-labelledby="feedback-heading"
    >
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

        <TestimonialWall />

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
