import * as Sentry from '@sentry/browser';

// Client-side error monitoring — see src/instrumentation.ts for why this
// uses @sentry/browser directly instead of @sentry/nextjs. No-ops until
// NEXT_PUBLIC_SENTRY_DSN is set — see .env.example.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: 0,
  });
}
