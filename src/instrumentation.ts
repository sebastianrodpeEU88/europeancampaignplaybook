import type { Instrumentation } from 'next';

// Server-side error monitoring. Uses @sentry/node directly rather than
// @sentry/nextjs — that package's webpack/turbopack build plugin assumes
// standard Next.js internals, which this fork's file conventions (see
// src/proxy.ts) already diverge from. Next's own instrumentation hooks
// (register/onRequestError) give us the same error-capture outcome without
// depending on Sentry's Next-specific build tooling.
//
// No-ops until SENTRY_DSN is set — see .env.example.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || !process.env.SENTRY_DSN) {
    return;
  }

  const Sentry = await import('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0,
  });
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  const Sentry = await import('@sentry/node');
  Sentry.captureException(error, {
    extra: {
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routeType: context.routeType,
      routePath: context.routePath,
    },
  });
  // Serverless functions can be frozen/terminated immediately after the
  // response is sent, before Sentry's background queue has flushed.
  await Sentry.flush(2000);
};
