import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'privacy policy',
  description:
    'How european campaign playbook (ROLLOUT DEMOCRACY) collects, processes, and protects your personal data, including our use of AI tools and your rights under the GDPR.',
};

const CONTACT_EMAIL = 'sebastian@campaignplaybook.eu';

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-ink underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
    >
      {children}
    </a>
  );
}

function Mail() {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="text-ink underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
    >
      {CONTACT_EMAIL}
    </a>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-ink mt-10 mb-3 scroll-mt-20">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-ink mt-6 mb-2">{children}</h3>;
}

export default function PrivacyPage() {
  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-3xl mx-auto text-ink/75 leading-relaxed">
          <h1 className="display text-3xl text-ink mb-2">privacy policy</h1>
          <p className="text-sm text-ink/50 mb-8">Last updated: 14 August 2026</p>

          <p className="mb-4">
            To carry out our activity, we process the personal data that our clients and users
            provide to us through the forms enabled on our website and in physical form at our
            attention points, in order to resolve queries, manage sales, and keep our subscribers
            informed about news that may be of interest to them.
          </p>
          <p className="mb-4">
            If you are not yet our client and are only a user of this website, the only personal
            data we process about you is the data managed through the cookies we use on this page
            (please read our{' '}
            <Link
              href={routes.cookies()}
              className="text-ink underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
            >
              Cookie Policy
            </Link>{' '}
            for more information) and any data you have voluntarily
            sent us through the contact channels we make available on this website to attend to your
            queries.
          </p>
          <p className="mb-4">
            Our clients and subscribers may also receive periodic information about news related to
            our activity, including commercial promotions, new products, or important developments
            in the sector. We will only send this information if you have given us your consent, and
            if you decide to stop receiving these communications, you only have to tell us through
            the contact forms available on the website or through the unsubscribe option included in
            each communication we send.
          </p>
          <p className="mb-4">
            We do <strong>not</strong> carry out recruitment or personnel selection through our
            website. If you send us personal data because you are interested in working with us —
            including any CV data — it will be processed solely for its immediate deletion.
          </p>
          <p>
            Below we explain the different aspects to take into account regarding the processing of
            the personal data we collect from you.
          </p>

          <H>Data Controller</H>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Controller:</strong> ROLLOUT DEMOCRACY</li>
            <li><strong>Postal address:</strong> Avenida Lagartijo 20, 1-3 – Spain</li>
            <li><strong>Email:</strong> <Mail /></li>
          </ul>

          <H>Purposes of the processing</H>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              To manage the questions and queries you present to us regarding our services,
              products, prices, promotions, or any other feature shown or referred to in the
              information we publish on the website — whether through the forms enabled for this
              purpose, by telephone, or through the email address shown on the website.
            </li>
            <li>To manage personal data related to the marketing and provision of our services.</li>
            <li>
              To send commercial information about our products, catalogues, and sector news to
              those who have subscribed to receive it.
            </li>
          </ul>

          <H>Legal basis for the processing</H>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              For attending to your queries and managing sales, we process your data on the basis of
              the performance of a contract or the application of pre-contractual measures
              (<strong>Art. 6.1.b GDPR</strong>).
            </li>
            <li>
              For sending commercial information, we rely on your express consent
              (<strong>Art. 6.1.a GDPR</strong>).
            </li>
            <li>
              For our AI-assisted services (see <em>Use of Artificial Intelligence</em> below), we
              process the data you voluntarily provide on the basis of your consent and/or the
              performance of our services (<strong>Art. 6.1.a / 6.1.b GDPR</strong>).
            </li>
          </ul>
          <p className="mt-3">
            These legal bases are complemented by compliance with the legal obligations of the
            controller in the cases where they apply.
          </p>

          <H>Recipients of the information</H>
          <p className="mb-4">
            Your data is shared with our data processors (service providers), who undertake to comply
            with current data protection legislation and with the instructions we give them regarding
            the processing of data, and who may not use it for any purpose other than those set out
            in this policy. The specific providers we rely on are listed in the <em>Tools we use</em>{' '}
            and <em>Use of Artificial Intelligence</em> sections below.
          </p>
          <p>
            We do not sell your personal data, and we do not share it with third parties for their
            own independent purposes.
          </p>

          <H>International data transfers</H>
          <p>
            Some of the providers we rely on (for example, OpenAI, Anthropic, Google, Zoom, and
            Slack) may process data on servers located outside the European Economic Area (EEA).
            Where this happens, such transfers are carried out under the safeguards required by the
            GDPR — such as the European Commission&apos;s Standard Contractual Clauses (SCCs) and/or
            an adequacy decision — so that your data continues to enjoy an equivalent level of
            protection. You may request further information about these safeguards through the
            contact details in the <em>Your rights</em> section.
          </p>

          <H>Retention periods</H>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Provision of our services:</strong> We will keep your data for four years from
              the end of the commercial relationship.
            </li>
            <li>
              <strong>Commercial purposes:</strong> We will keep your data while your subscription to
              receive our communications remains active and you have not objected to receiving them.
              Once you have expressed your refusal to receive information, we will delete your data —
              subject to any legal obligations that may require a longer retention period, in which
              case the data will be duly blocked.
            </li>
            <li>
              <strong>AI-assisted services:</strong> Data processed to generate your personalized
              Action Plan and related content is retained only for as long as necessary to provide
              these services, in line with the retention periods above.
            </li>
          </ul>
          <p className="mt-3">
            Please bear in mind that compliance with a legal obligation may require us to retain your
            data, or part of it, for a longer period.
          </p>

          <H>Your rights</H>
          <p className="mb-4">
            All users whose personal data is processed may exercise their rights of{' '}
            <strong>
              access, rectification, erasure, objection to processing, restriction of processing,
              portability
            </strong>{' '}
            (where possible under current legislation), and the right to information about{' '}
            <strong>automated individual decisions</strong> (where such decisions are made).
          </p>
          <p className="mb-2">You may exercise these rights through either of the following channels:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>In writing</strong>, sending your request together with a copy of documentation
              proving your identity to:
              <div className="mt-1 pl-3 border-l-2 border-rule/25 text-ink/70">
                ROLLOUT DEMOCRACY — Attention to Personal Data<br />
                Avenida Lagartijo 20, 1-3 – Spain
              </div>
            </li>
            <li>
              <strong>By email</strong> to <Mail />, either digitally signing your request using the
              Spanish electronic National Identity Document (DNI) or attaching a copy of your DNI, in
              which case no further identity verification is required.
            </li>
          </ul>

          <H>Supervisory authority</H>
          <p>
            If you consider that your rights have been disregarded or infringed, you can file a
            complaint with the competent supervisory authority, which in this case is the{' '}
            <strong>Spanish Data Protection Agency (AEPD)</strong>. If you consider it appropriate,
            you may also contact any other competent supervisory authority within the European Union.
          </p>

          <H>Accessibility</H>
          <p className="mb-4">
            We are committed to making our website and services usable by as many people as possible,
            regardless of ability or technology.
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Standards we aim for.</strong> We work towards conformance with the{' '}
              <strong>Web Content Accessibility Guidelines (WCAG) 2.1 at level AA</strong> and align
              our efforts with the European standard <strong>EN 301 549</strong> and the{' '}
              <strong>European Accessibility Act</strong>.
            </li>
            <li>
              <strong>What we do.</strong> In practice this includes using semantic HTML and clear
              document structure, supporting keyboard navigation and visible focus states,
              maintaining sufficient colour contrast, providing text alternatives for meaningful
              images, and respecting user preferences such as reduced motion.
            </li>
            <li>
              <strong>Ongoing effort.</strong> Accessibility is a continuous process. Some content,
              or material provided by third parties, may not yet fully conform, and we work to
              identify and correct issues as part of our regular improvements.
            </li>
            <li>
              <strong>Contact and alternative formats.</strong> If you encounter an accessibility
              barrier, or if you need information from this website in an alternative format, please
              contact us at <Mail />. We will do our best to respond promptly and to provide the
              information you need in an accessible way.
            </li>
          </ul>

          <H>Tools we use</H>
          <p className="mb-4">
            For the proper development of our activity, we use the following tools. Below we explain
            what we use each of them for and provide links to their privacy policies:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Mighty Networks</strong> — to manage our community of subscribers and the
              members who join our membership.{' '}
              <Ext href="https://www.mightynetworks.com/privacy-policy">Privacy policy</Ext>
            </li>
            <li>
              <strong>Zapier</strong> — to automate our processes and connect our different services.{' '}
              <Ext href="https://zapier.com/privacy">Privacy policy</Ext>
            </li>
            <li>
              <strong>Slack</strong> — for internal communication and team management.{' '}
              <Ext href="https://slack.com/intl/en-gb/trust/privacy/privacy-policy">Privacy policy</Ext>
            </li>
            <li>
              <strong>Zoom</strong> — for video meetings, webinars, and online events with our
              members and clients.{' '}
              <Ext href="https://www.zoom.com/en/trust/privacy/">Privacy policy</Ext>
            </li>
            <li>
              <strong>Typeform</strong> — to collect data through online forms and surveys.{' '}
              <Ext href="https://www.typeform.com/legal">Privacy policy</Ext>
            </li>
          </ul>

          <H>Use of Artificial Intelligence (AI)</H>
          <p>
            As part of the <strong>campAIgnPro Experience</strong>, we use artificial intelligence
            (AI) tools to provide a more personalized and effective service to our users.
          </p>

          <H3>Purposes</H3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To generate personalized Action Plans based on the information you voluntarily provide.</li>
            <li>
              To recommend learning paths, mentoring opportunities, and networking activities aligned
              with your profile and career goals.
            </li>
            <li>
              To support you with automated suggestions and guidance (daily, weekly, monthly, or on
              demand) that enhance your career-development journey.
            </li>
          </ul>

          <H3>Tools used</H3>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>OpenAI</strong> — we use OpenAI models (such as GPT) to process the data you
              provide and generate personalized career-development content.{' '}
              <Ext href="https://openai.com/policies/privacy-policy/">Privacy policy</Ext>
            </li>
            <li>
              <strong>Anthropic (Claude)</strong> — we use Anthropic&apos;s Claude models to process
              the data you provide and generate personalized career-development content and guidance.{' '}
              <Ext href="https://www.anthropic.com/legal/privacy">Privacy policy</Ext>
            </li>
            <li>
              <strong>Zapier</strong> — acts as the automation layer between our AI tools and our
              other systems (Typeform, Google Workspace, etc.).{' '}
              <Ext href="https://zapier.com/privacy">Privacy policy</Ext>
            </li>
            <li>
              <strong>Google Workspace (Docs, Slides, Drive, Calendar)</strong> — used to structure,
              present, and securely share your personalized Action Plan.{' '}
              <Ext href="https://policies.google.com/privacy">Privacy policy</Ext>
            </li>
          </ul>

          <H3>Data handling</H3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Only the information you voluntarily provide through our surveys and forms is processed by our AI tools.</li>
            <li>
              Your data is used solely to generate your personalized Action Plan and related
              services; it is not shared with third parties for other uses.
            </li>
            <li>
              Processing is subject to GDPR principles, in particular{' '}
              <strong>data minimization, purpose limitation, and transparency</strong>.
            </li>
            <li>
              You may exercise your rights of access, rectification, and erasure at any time, as
              explained in the <em>Your rights</em> section of this policy.
            </li>
          </ul>

          <H3>Responsible and agentic use of AI</H3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              We use <strong>agentic AI</strong> — AI systems capable of carrying out multi-step
              tasks on our behalf (for example, drafting your Action Plan, organising related
              documents, or preparing follow-up guidance). Whenever agentic AI is used, it operates{' '}
              <strong>strictly within the purposes described in this policy</strong> and{' '}
              <strong>always preserves your rights and the confidentiality of your data</strong>, in
              full compliance with the <strong>GDPR and other applicable legislation</strong>.
            </li>
            <li>
              AI is used as a <strong>support tool</strong> to structure and suggest
              career-development actions; it does not replace human judgment.
            </li>
            <li>
              <strong>All final decisions remain with you.</strong> AI outputs are recommendations,
              not mandates, and human oversight is maintained over agentic workflows.
            </li>
            <li>
              We continuously review our use of AI to ensure it remains aligned with our values of{' '}
              <strong>privacy, transparency, and empowerment</strong>.
            </li>
          </ul>
        </div>
      </Container>
    </div>
  );
}
