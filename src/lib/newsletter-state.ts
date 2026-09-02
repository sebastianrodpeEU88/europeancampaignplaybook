// Kept out of newsletter-actions.ts because a "use server" file may only export
// async functions (not types or constants).
export type NewsletterState =
  | { status: 'idle' }
  | { status: 'ok' }
  | { status: 'error'; message: string };

export const idleNewsletterState: NewsletterState = { status: 'idle' };
