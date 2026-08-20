import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieNotice from '@/components/CookieNotice';

// Self-hosted (downloaded from Google Fonts, latin subset) so builds never
// depend on fetching fonts.gstatic.com at build time.
const robotoCondensed = localFont({
  src: './fonts/roboto-condensed-700.woff2',
  weight: '700',
  variable: '--font-roboto-condensed',
  display: 'swap',
});

const inter = localFont({
  src: './fonts/inter.woff2',
  weight: '400 600',
  variable: '--font-inter',
  display: 'swap',
});

const sourceSerif = localFont({
  src: './fonts/source-serif-4-400.woff2',
  weight: '400',
  variable: '--font-source-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | european campaign playbook',
    default: 'european campaign playbook',
  },
  description:
    'campaign knowledge, built to move. Practitioner-led, EU-first knowledge for political campaigning, public affairs, and civic engagement — non-partisan and compliance-aware.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-GB"
      className={`${robotoCondensed.variable} ${inter.variable} ${sourceSerif.variable}`}
    >
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <CookieNotice />
      </body>
    </html>
  );
}
