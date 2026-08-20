import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'cookie policy',
  description:
    'How european campaign playbook (ROLLOUT DEMOCRACY) uses cookies. We use only strictly necessary cookies required to sign you in and keep the site secure, in line with the ePrivacy rules and the GDPR.',
};

const CONTACT_EMAIL = 'sebastian@campaignplaybook.eu';

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

const COOKIE_ROWS: { name: string; purpose: string; category: string; retention: string }[] = [
  {
    name: 'Authentication / session (set by our authentication provider, Supabase)',
    purpose: 'Keeps you signed in and maintains your session as you move between pages of your account.',
    category: 'Strictly necessary',
    retention: 'Session and refresh token — until you log out or the session expires.',
  },
  {
    name: 'Security / sign-in flow',
    purpose: 'Protects the login process (for example, verifying the authentication exchange) and helps prevent misuse.',
    category: 'Strictly necessary',
    retention: 'Short-lived; typically deleted once sign-in completes.',
  },
  {
    name: 'Platform / load-balancing cookies (set by our hosting provider)',
    purpose: 'Allow the website to be served reliably and securely.',
    category: 'Strictly necessary',
    retention: 'Session or short-lived.',
  },
];

export default function CookiesPage() {
  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-3xl mx-auto text-ink/75 leading-relaxed">
          <h1 className="display text-3xl text-ink mb-2">cookie policy</h1>
          <p className="text-sm text-ink/50 mb-8">Last updated: 20 August 2026</p>

          <p className="mb-4">
            This Cookie Policy explains how european campaign playbook, operated by{' '}
            <strong>ROLLOUT DEMOCRACY</strong>, uses cookies and similar technologies on this
            website. It should be read together with our{' '}
            <Link
              href={routes.privacy()}
              className="text-ink underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
            >
              Privacy Policy
            </Link>
            , which explains how we process personal data more generally.
          </p>

          <H>What are cookies?</H>
          <p>
            Cookies are small text files that a website stores on your device when you visit it.
            They are widely used to make websites work, to keep you signed in, and to remember your
            actions and preferences. Similar technologies (such as local storage) can be used for
            comparable purposes; where relevant, references to &ldquo;cookies&rdquo; in this policy
            also cover those technologies.
          </p>

          <H>Our approach to cookies</H>
          <p className="mb-4">
            We keep our use of cookies to the minimum needed to run the website. At present, we use
            <strong> only strictly necessary cookies</strong> — the cookies required for the site to
            function, to sign you in, and to keep your session secure.
          </p>
          <p className="mb-4">
            We do <strong>not</strong> use advertising cookies, and we do{' '}
            <strong>not</strong> use third-party analytics or tracking cookies to profile you. Under
            the ePrivacy rules and the GDPR, strictly necessary cookies do not require your prior
            consent; if we introduce any non-essential cookies (for example, analytics) in the
            future, we will ask for your consent before setting them and update this policy
            accordingly.
          </p>
          <p>
            When you first visit, we show a short notice explaining that we use only essential
            cookies. Because there are no optional cookies to accept or reject, this notice is purely
            informational. To avoid showing it on every visit, we remember that you have seen it using
            your browser&apos;s <strong>local storage</strong> — this stores no personal data and sets
            no cookie. You can clear it at any time through your browser&apos;s settings.
          </p>

          <H>Cookies we use</H>
          <div className="mt-4 overflow-x-auto rounded-[2px] border border-rule/20">
            <table className="w-full text-sm text-left">
              <thead className="bg-ink/[0.04] text-ink">
                <tr>
                  <th className="px-4 py-3 font-semibold align-top">Cookie / purpose</th>
                  <th className="px-4 py-3 font-semibold align-top">Category</th>
                  <th className="px-4 py-3 font-semibold align-top">Retention</th>
                </tr>
              </thead>
              <tbody>
                {COOKIE_ROWS.map((row) => (
                  <tr key={row.name} className="border-t border-rule/15 align-top">
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink">{row.name}.</span>{' '}
                      <span className="text-ink/70">{row.purpose}</span>
                    </td>
                    <td className="px-4 py-3 text-ink/70 whitespace-nowrap">{row.category}</td>
                    <td className="px-4 py-3 text-ink/70">{row.retention}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-ink/55">
            Exact cookie names may vary as our providers update their software. If you would like a
            precise, current list, contact us at <Mail />.
          </p>

          <H>Third-party content</H>
          <p>
            Some pages may include content provided by third parties — for example, forms (Typeform),
            video meetings or recordings (Zoom), or embedded videos. When you interact with that
            content, the provider may set its own cookies, which are governed by that provider&apos;s
            own cookie and privacy policies. You can find links to the privacy policies of the
            providers we use in the <em>Tools we use</em> and <em>Use of Artificial Intelligence</em>{' '}
            sections of our{' '}
            <Link
              href={routes.privacy()}
              className="text-ink underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
            >
              Privacy Policy
            </Link>
            .
          </p>

          <H>How to manage cookies</H>
          <p className="mb-4">
            You can control and delete cookies through your browser settings. Most browsers let you
            block or remove cookies, and warn you before they are set. The help pages of your browser
            (Chrome, Firefox, Safari, Edge, and others) explain how to do this.
          </p>
          <p>
            Please note that because we use only strictly necessary cookies, blocking or deleting
            them may prevent parts of the website from working correctly — in particular, you may not
            be able to sign in or stay signed in to your account.
          </p>

          <H>Changes to this policy</H>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in the technologies
            we use or in applicable law. When we do, we will revise the &ldquo;Last updated&rdquo;
            date at the top of this page.
          </p>

          <H>Contact</H>
          <p>
            If you have any questions about our use of cookies, you can contact us at <Mail />.
          </p>
        </div>
      </Container>
    </div>
  );
}
