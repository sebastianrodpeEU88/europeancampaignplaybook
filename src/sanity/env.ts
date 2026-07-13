export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-07-12';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
// Server-side only (never NEXT_PUBLIC_). Viewer-scoped token used to read
// content — kept separate from anonymous/public dataset access, which has
// proven unreliable. Never sent to the browser.
export const readToken = process.env.SANITY_API_READ_TOKEN;

if (!projectId) {
  throw new Error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID. Copy .env.example to .env.local and set it to your Sanity project ID.'
  );
}
