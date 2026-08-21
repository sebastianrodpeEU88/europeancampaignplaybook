import type { Metadata } from 'next';
import Container from '@/components/Container';

const CONTACT_EMAIL = 'sebastian@campaignplaybook.eu';

// Flip these to true (and fill the matching arrays) when the content is ready.
const SHOW_CLIENTS = false;
const SHOW_CONSULTANTS = false;

const SPECIALISMS = [
  {
    title: 'EU-wide campaigns',
    body: 'Coordinated campaigns that carry one agenda across the Union: strategy, messaging, and mobilisation, including AI and social media, built to work across member states and languages.',
  },
  {
    title: 'EU public affairs & influence campaigns',
    body: 'Shaping policy and decision-making in Brussels and the capitals: stakeholder mapping, narrative, and policy communications that move institutions.',
  },
  {
    title: 'International campaigns',
    body: 'Cross-border campaigns beyond the EU, adapting strategy across jurisdictions, regulatory contexts, and audiences.',
  },
];

// Populate when ready, then set SHOW_CLIENTS = true.
const PAST_CLIENTS: { name: string }[] = [];

// Populate when ready, then set SHOW_CONSULTANTS = true.
const CONSULTANTS: { name: string; role: string; bio: string }[] = [];

export const metadata: Metadata = {
  title: 'consultancy and advice',
  description:
    'Specialist campaign consultancy in Brussels and across the EU: EU-wide campaigns, public affairs and influence, AI, social media, and policy communications.',
};

export default function ConsultancyPage() {
  const contactHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Consultancy enquiry')}`;

  return (
    <div className="bg-paper">
      {/* Hero */}
      <section className="py-16 sm:py-20 bg-navy">
        <Container>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#EDE7DA]/60 mb-4">
              What we do
            </p>
            <h1 className="display text-[#EDE7DA] text-4xl sm:text-5xl mb-5">consultancy and advice</h1>
            <p className="text-lg text-[#EDE7DA]/75 leading-relaxed mb-8 max-w-2xl">
              When you need more than the knowledge library, when you need a team that has run the
              campaigns, we work alongside you. In Brussels and across the EU, we are specialists in
              EU-wide campaigns, EU public affairs and influence campaigns, and international
              campaigns, from AI and social media to policy communications.
            </p>
            <a
              href={contactHref}
              className="inline-flex rounded-[2px] bg-paper px-6 py-3 text-sm font-semibold text-navy hover:bg-[#EDE7DA]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            >
              Get in touch
            </a>
          </div>
        </Container>
      </section>

      {/* Specialisms */}
      <section className="py-16" aria-labelledby="specialisms-heading">
        <Container>
          <h2 id="specialisms-heading" className="display text-2xl text-ink mb-8">
            what we specialise in
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SPECIALISMS.map((s) => (
              <div key={s.title} className="rounded-[2px] border border-rule/20 p-6">
                <h3 className="font-semibold text-ink mb-2">{s.title}</h3>
                <p className="text-sm text-ink/65 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Past clients — hidden until content is ready (set SHOW_CLIENTS = true) */}
      {SHOW_CLIENTS && PAST_CLIENTS.length > 0 && (
        <section className="py-16 border-t border-rule/15" aria-labelledby="clients-heading">
          <Container>
            <h2 id="clients-heading" className="display text-2xl text-ink mb-2">
              who we&apos;ve worked with
            </h2>
            <p className="text-ink/60 text-sm mb-8">
              A selection of the organisations we&apos;ve advised.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {PAST_CLIENTS.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-center rounded-[2px] border border-rule/20 p-6 text-sm text-ink/70"
                >
                  {c.name}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Consultants — hidden until content is ready (set SHOW_CONSULTANTS = true) */}
      {SHOW_CONSULTANTS && CONSULTANTS.length > 0 && (
        <section className="py-16 border-t border-rule/15" aria-labelledby="team-heading">
          <Container>
            <h2 id="team-heading" className="display text-2xl text-ink mb-8">
              meet the consultants
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
              {CONSULTANTS.map((p) => (
                <div key={p.name} className="rounded-[2px] border border-rule/20 p-6">
                  <h3 className="font-semibold text-ink">{p.name}</h3>
                  <p className="mb-2 text-sm text-ink/55">{p.role}</p>
                  <p className="text-sm leading-relaxed text-ink/70">{p.bio}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Contact */}
      <section className="py-8">
        <Container>
          <div className="my-4 rounded-[2px] bg-navy p-8 text-[#EDE7DA]">
            <div className="max-w-2xl">
              <h2 className="display text-2xl text-[#EDE7DA] mb-3">tell us about your campaign</h2>
              <p className="text-[#EDE7DA]/75 leading-relaxed mb-6">
                Whether it&apos;s an EU-wide push, a public affairs and influence campaign, or an
                international effort, we&apos;d like to hear about it. Email us and we&apos;ll get back
                to you.
              </p>
              <a
                href={contactHref}
                className="inline-flex rounded-[2px] bg-paper px-5 py-2.5 text-sm font-semibold text-navy hover:bg-[#EDE7DA]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                Email {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
