import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'privacy policy',
  description:
    'How european campaign playbook (ROLLOUT DEMOCRACY) collects, processes and protects your personal data: accounts, membership, events, the newsletter, the tools we rely on, our use of AI, and your rights under the GDPR.',
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

function In({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-ink underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
    >
      {children}
    </Link>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-ink mt-10 mb-3 scroll-mt-20">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-ink mt-6 mb-2">{children}</h3>;
}

// One processor row: what it does for us, and where its own policy lives.
function Tool({ name, href, children }: { name: string; href: string; children: React.ReactNode }) {
  return (
    <li>
      <strong>{name}</strong> — {children} <Ext href={href}>Privacy policy</Ext>
    </li>
  );
}

export default function PrivacyPage() {
  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-3xl mx-auto text-ink/75 leading-relaxed">
          <h1 className="display text-3xl text-ink mb-2">privacy policy</h1>
          <p className="text-sm text-ink/50 mb-8">Last updated: 23 September 2026</p>

          <p className="mb-4">
            This policy explains what we do with personal data at{' '}
            <strong>european campaign playbook</strong>: when you read the site, create an account,
            join the membership, register for a workshop, work through the digital bootcamp, or
            subscribe to the newsletter.
          </p>
          <p className="mb-4">
            You can read almost everything here without giving us anything. Some parts of the site
            need an account, because they track your own progress or your registration. Where that
            is the case, we say so below.
          </p>
          <p>
            For cookies and similar technologies, see our <In href={routes.cookies()}>cookie policy</In>.
          </p>

          <H>Data controller</H>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Controller:</strong> ROLLOUT DEMOCRACY, trading as european campaign playbook</li>
            <li><strong>Postal address:</strong> Avenida Lagartijo 20, 1-3 – Spain</li>
            <li><strong>Email:</strong> <Mail /></li>
          </ul>

          <H>What we collect, and why</H>

          <H3>Reading the site</H3>
          <p className="mb-2">
            You do not need an account to read articles, browse workshops, or open the prompt
            library. Our hosting provider records technical data such as your IP address, browser
            and the pages requested, in server logs used to keep the site running and secure. We
            also measure page views with a cookieless analytics tool that does not build a profile
            of you or follow you across other websites.
          </p>

          <H3>Creating an account</H3>
          <p className="mb-2">
            Accounts are passwordless: you give us an email address and we send you a sign-in link.
            We store your email address, the dates you signed up and last signed in, and whether you
            confirmed your address. If you never confirm it, we may send you one final reminder,
            after which we do not contact you again.
          </p>
          <p className="mb-2">
            When you set up your profile, we ask for your first and last name and, optionally, your
            phone number, career stage, organisation type, current employer and areas of interest.
            You can change or remove these at any time from your account page.
          </p>

          <H3>Membership and payments</H3>
          <p className="mb-2">
            If you take a paid membership, our payment provider handles the payment and stores the
            card details. We never see or store your card number. We keep your membership tier,
            billing interval, status, renewal date and the payment provider&apos;s customer and
            subscription identifiers, so we know what you have access to. Memberships we arrange
            directly, such as corporate ones, are recorded by us with the plan, price and renewal
            date.
          </p>

          <H3>Workshops and events</H3>
          <p className="mb-2">
            When you register for a workshop or event, we record which event it is and when, so we
            can admit you, send your confirmation with a calendar invitation, and send a reminder
            before it starts. Online sessions run on a third-party video platform, which processes
            your data under its own policy when you join.
          </p>

          <H3>The digital bootcamp</H3>
          <p className="mb-2">
            If you mark a bootcamp episode as complete, we store which episodes you have completed,
            so the site can show you where you are. That is all we record about how you use the
            lessons and the prompt library.
          </p>

          <H3>Newsletter</H3>
          <p className="mb-2">
            If you opt in, we pass your email address to our newsletter platform, which sends you a
            confirmation email first. You stay unsubscribed unless you click that confirmation. Every
            newsletter has an unsubscribe link, and you can also opt out from your account page.
          </p>

          <H3>Our contact records</H3>
          <p className="mb-2">
            When you complete your profile, we copy your name, email address, phone number if you
            gave one, career stage, organisation type, employer and newsletter preference into our
            contact database, so we can keep track of who we work with and answer you properly.
          </p>

          <H3>Emails we send you</H3>
          <p className="mb-2">
            Sign-in links, account emails, event confirmations and reminders are sent through our
            email provider. Our own team receives a copy of the final reminder sent to unconfirmed
            accounts, so we can see what went out.
          </p>

          <H3>Questions you send us</H3>
          <p>
            If you email us, we keep your message and our reply for as long as we need them to deal
            with the matter and to keep a record of it.
          </p>

          <H>Legal bases</H>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Contract (Art. 6.1.b GDPR):</strong> running your account, giving you access
              to members&apos; content, taking payment, and registering you for events.
            </li>
            <li>
              <strong>Consent (Art. 6.1.a GDPR):</strong> the newsletter, and any optional profile
              details you choose to give us. You can withdraw consent at any time.
            </li>
            <li>
              <strong>Legitimate interests (Art. 6.1.f GDPR):</strong> keeping the site secure and
              available, preventing abuse and bot signups, measuring page views without profiling,
              maintaining our contact records, and improving what we publish.
            </li>
            <li>
              <strong>Legal obligation (Art. 6.1.c GDPR):</strong> accounting and tax records for
              payments, and responding to lawful requests.
            </li>
          </ul>
          <p className="mt-3">
            We do not process special categories of data, such as political opinions, about our
            readers or members. We do not use your data for political profiling or targeted
            political advertising, and we do not sell it.
          </p>

          <H>Who processes data for us</H>
          <p className="mb-4">
            These providers process personal data on our behalf, under contract and only on our
            instructions. They run the website and the services around it.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <Tool name="Supabase" href="https://supabase.com/privacy">
              accounts, sign-in links and the database holding profiles, memberships, event
              registrations and bootcamp progress.
            </Tool>
            <Tool name="Vercel" href="https://vercel.com/legal/privacy-policy">
              hosting, server logs, and cookieless page-view analytics.
            </Tool>
            <Tool name="Stripe" href="https://stripe.com/privacy">
              payments and subscription billing. Card details are handled by Stripe, not by us.
            </Tool>
            <Tool name="Resend" href="https://resend.com/legal/privacy-policy">
              delivery of sign-in links, account emails, and event confirmations and reminders.
            </Tool>
            <Tool name="Beehiiv" href="https://www.beehiiv.com/privacy">
              the newsletter, including its confirmation and unsubscribe handling.
            </Tool>
            <Tool name="Notion" href="https://www.notion.so/notion/Privacy-Policy-3468d120cf614d4c9014c09f6adc9091">
              our contact database.
            </Tool>
            <Tool name="Cloudflare" href="https://www.cloudflare.com/privacypolicy/">
              the bot check on our sign-in and sign-up forms.
            </Tool>
            <Tool name="Sanity" href="https://www.sanity.io/legal/privacy">
              the content management system behind our articles, images and downloads. It holds
              published content, not reader data.
            </Tool>
            <Tool name="Zoom" href="https://www.zoom.com/en/trust/privacy/">
              online workshops and events.
            </Tool>
          </ul>
          <p className="mt-4 mb-2">We also use these tools in our wider work:</p>
          <ul className="list-disc pl-5 space-y-2">
            <Tool name="Mighty Networks" href="https://www.mightynetworks.com/privacy-policy">
              our legacy community platform. New community activity happens here on this site; the
              platform still holds member data and conversations from that earlier period.
            </Tool>
            <Tool name="Google Workspace" href="https://policies.google.com/privacy">
              email, documents and calendars.
            </Tool>
            <Tool name="Slack" href="https://slack.com/intl/en-gb/trust/privacy/privacy-policy">
              internal team communication.
            </Tool>
            <Tool name="Zapier" href="https://zapier.com/privacy">
              connecting our systems to each other.
            </Tool>
            <Tool name="Typeform" href="https://www.typeform.com/legal">
              occasional forms and surveys.
            </Tool>
          </ul>

          <H>International data transfers</H>
          <p>
            Some of these providers process data on servers outside the European Economic Area. Where
            that happens, the transfer is covered by the safeguards the GDPR requires, such as the
            European Commission&apos;s Standard Contractual Clauses or an adequacy decision, so your
            data keeps an equivalent level of protection. You can ask us for details using the
            contact details above.
          </p>

          <H>How long we keep it</H>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Account and profile:</strong> for as long as your account is open. If you ask
              us to delete it, we act on that as described below.
            </li>
            <li>
              <strong>Membership and payment records:</strong> four years after the end of the
              relationship, and longer where accounting or tax law requires it.
            </li>
            <li>
              <strong>Event registrations:</strong> for as long as needed to run the event and keep a
              record of attendance.
            </li>
            <li>
              <strong>Newsletter:</strong> until you unsubscribe, plus a record of the unsubscribe so
              we do not email you again by mistake.
            </li>
            <li>
              <strong>Unconfirmed accounts:</strong> if an address is never confirmed, we send one
              final reminder and then stop contacting it.
            </li>
            <li>
              <strong>Server logs:</strong> kept for a short period by our hosting provider for
              security and troubleshooting.
            </li>
            <li>
              <strong>Our legacy community platform:</strong> member data and conversations from
              that period stay there until we close the account down. You can ask us to remove your
              data from it at any time, using the contact details below.
            </li>
          </ul>

          <H>Your rights</H>
          <p className="mb-4">
            You have the right of <strong>access, rectification, erasure, objection, restriction</strong>{' '}
            and <strong>portability</strong>, and the right to withdraw consent at any time.
          </p>
          <p className="mb-2">Two of these you can use yourself, from your account page:</p>
          <ul className="list-disc pl-5 space-y-1.5 mb-4">
            <li>
              <strong>Download my data</strong> gives you a file with your profile, membership,
              event registrations and bootcamp progress.
            </li>
            <li>
              <strong>Request account deletion</strong> closes your account immediately, cancels any
              paid membership, and passes the request to us to complete the removal of your data.
            </li>
          </ul>
          <p className="mb-2">You can also contact us directly:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>By email</strong> to <Mail />, from the address we hold for you where possible,
              so we can recognise you.
            </li>
            <li>
              <strong>In writing</strong>, with a copy of proof of identity, to:
              <div className="mt-1 pl-3 border-l-2 border-rule/25 text-ink/70">
                ROLLOUT DEMOCRACY — Attention to Personal Data<br />
                Avenida Lagartijo 20, 1-3 – Spain
              </div>
            </li>
          </ul>

          <H>Security</H>
          <p>
            Access to member data is limited to the people who need it. Sign-in is passwordless, so
            there is no password for us to lose. Payment details never reach our servers. Data in our
            database is protected by per-user access rules, and administrative access is restricted
            to named accounts.
          </p>

          <H>Supervisory authority</H>
          <p>
            If you think we have handled your data badly, please tell us first so we can put it
            right. You can also complain to the{' '}
            <strong>Spanish Data Protection Agency (AEPD)</strong>, or to the supervisory authority
            in your own country.
          </p>

          <H>Use of artificial intelligence</H>
          <p className="mb-4">
            AI is part of what we teach, so it is worth being precise about how we use it ourselves.
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>We use AI tools to help produce what we publish:</strong> researching, drafting,
              editing, translating and making diagrams for articles, workshops and bootcamp material.
              A human reviews and approves everything before it goes out.
            </li>
            <li>
              <strong>We do not feed your personal data into AI tools.</strong> The website does not
              send your profile, membership, registrations or progress to any AI provider.
            </li>
            <li>
              <strong>No decisions about you are made by a machine.</strong> We do not carry out
              automated decision-making or profiling that produces legal or similarly significant
              effects, as described in Article 22 of the GDPR.
            </li>
            <li>
              <strong>In workshops and the bootcamp</strong>, you use your own AI accounts, and
              whatever you type there is governed by the policy of the provider you chose. We tell
              participants not to paste personal, confidential or sensitive material into those
              tools.
            </li>
            <li>
              The AI tools we use in our own production work include{' '}
              <Ext href="https://openai.com/policies/privacy-policy/">OpenAI</Ext> and{' '}
              <Ext href="https://www.anthropic.com/legal/privacy">Anthropic</Ext>.
            </li>
          </ul>

          <H>Children</H>
          <p>
            This site is meant for professionals and is not directed at children. We do not knowingly
            collect data from anyone under 16.
          </p>

          <H>Changes to this policy</H>
          <p>
            When our services or providers change, we update this page and the date at the top. If a
            change materially affects how we use your data, we will tell account holders directly.
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

          <p className="mt-10 text-sm text-ink/55">
            This policy describes our own practice. It is not legal advice, and it does not replace
            the terms of any agreement you have with us.
          </p>
        </div>
      </Container>
    </div>
  );
}
