// Permanent redirects for pages of THIS site that have been renamed. A slug
// change breaks every link already sent out — invitations, newsletters, calendar
// entries, posts — so the old path keeps working and points at the new one.
//
// Loaded by next.config.ts, after the legacy rules. Never add a source that is
// also a live route: redirects run before pages, so it would hide the page.

const renamed: [string, string][] = [
  // The 30 September session widened from an AI demo to an info session about
  // the community and the whole workshop calendar (renamed 24 September 2026).
  [
    '/events/ai-for-advocacy-live-demo-30-sep-2026',
    '/events/info-session-community-and-workshops-30-sep-2026',
  ],
];

export const renamedRedirects = renamed.map(([source, destination]) => ({
  source,
  destination,
  permanent: true as const,
}));
