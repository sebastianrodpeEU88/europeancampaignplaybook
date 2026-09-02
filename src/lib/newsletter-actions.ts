'use server';

import { subscribeToBeehiiv } from '@/lib/integrations/beehiiv';
import type { NewsletterState } from '@/lib/newsletter-state';

// Newsletter signup that goes straight to Beehiiv — no Typeform, no manual
// copying. Every submission lands in the publication automatically.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  // Honeypot — hidden from real users; bots that fill it are silently dropped.
  const honeypot = String(formData.get('company') || '').trim();
  if (honeypot) return { status: 'ok' };

  if (!EMAIL_RE.test(email)) {
    return { status: 'error', message: 'Please enter a valid email address.' };
  }

  const res = await subscribeToBeehiiv({ email, doubleOptIn: true });
  if (!res.ok) {
    return { status: 'error', message: 'Something went wrong — please try again in a moment.' };
  }
  return { status: 'ok' };
}
