import type { Metadata } from 'next';
import Link from 'next/link';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import SubscribeCTA from '@/components/SubscribeCTA';

export const metadata: Metadata = {
  title: 'Community',
  description: 'Join the Campaign Intelligence Library community — a growing network of EU campaign practitioners, public affairs professionals, and civic engagement specialists.',
};

const BENEFITS = [
  {
    title: 'Full knowledge library access',
    description: 'Unlock all articles across 16 knowledge pillars, including legal briefings, playbooks, and practitioner frameworks.',
  },
  {
    title: 'Downloadable templates and checklists',
    description: 'Access campaign templates, compliance checklists, and operational frameworks ready for immediate use.',
  },
  {
    title: 'AI prompt packs',
    description: 'Practitioner-built AI prompts for campaign content production, message testing, and research workflows.',
  },
  {
    title: 'EU compliance briefings',
    description: 'Regularly updated briefings on EU political advertising law, GDPR, the AI Act, and national Member State rules — reviewed by qualified practitioners.',
  },
  {
    title: 'Contributor field notes',
    description: 'Case studies and field notes from practitioners working in EU campaigns, written to share real-world experience.',
  },
  {
    title: 'Member-only playbooks',
    description: 'Detailed step-by-step playbooks on topics from war room operations to stakeholder mapping.',
  },
];

export default function CommunityPage() {
  return (
    <div className="bg-[#FDF6EC] min-h-screen py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-[#2B0A2E] mb-3">Community</h1>
            <p className="text-lg text-[#7A6380] leading-relaxed max-w-2xl">
              The Campaign Intelligence Library community is a growing network of EU campaign
              practitioners, public affairs professionals, researchers, and civic engagement
              specialists — built around a shared commitment to evidence-based, compliance-aware,
              non-partisan practice.
            </p>
          </div>

          {/* Membership benefits */}
          <section aria-labelledby="benefits-heading" className="mb-12">
            <h2 id="benefits-heading" className="text-xl font-bold text-[#2B0A2E] mb-6">
              Member benefits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BENEFITS.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white p-5"
                >
                  <p className="font-semibold text-[#2B0A2E] mb-1">{benefit.title}</p>
                  <p className="text-sm text-[#7A6380] leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contributor model */}
          <section aria-labelledby="contributor-heading" className="mb-12 rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white p-8">
            <h2 id="contributor-heading" className="text-xl font-bold text-[#2B0A2E] mb-4">
              Contributing to the library
            </h2>
            <p className="text-[#7A6380] leading-relaxed mb-4">
              The Campaign Intelligence Library depends on the expertise of practitioners across
              EU member states. If you are working in political campaigning, public affairs, civic
              technology, campaign research, or related disciplines, we welcome contributions in
              the form of articles, field notes, case studies, and compliance briefings.
            </p>
            <p className="text-[#7A6380] leading-relaxed mb-4">
              All contributors are required to provide a disclosure statement, and all articles
              touching regulation are peer-reviewed before publication. We do not accept content
              commissioned by vendors, platforms, or commercial interests.
            </p>
            <p className="text-sm text-[#A896AC]">
              The contributor programme is launching with the membership. If you are interested
              in contributing, register your interest via the community subscription.
            </p>
          </section>

          {/* Non-partisan commitment */}
          <section className="mb-12 rounded-2xl border-l-4 border-[#FF5B35] bg-white p-6">
            <h2 className="text-base font-semibold text-[#2B0A2E] mb-2">
              Non-partisan commitment
            </h2>
            <p className="text-sm text-[#7A6380] leading-relaxed">
              The Campaign Intelligence Library is committed to non-partisanship. We serve
              practitioners across the political spectrum and take no position on electoral
              contests, policy debates, or political parties. Our editorial standards apply
              equally to all content regardless of its political context.
            </p>
          </section>

          {/* CTA */}
          <SubscribeCTA />
        </div>
      </Container>
    </div>
  );
}
