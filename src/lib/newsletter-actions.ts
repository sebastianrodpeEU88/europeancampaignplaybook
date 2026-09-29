'use server';

import { after } from 'next/server';
import { subscribeToBeehiiv } from '@/lib/integrations/beehiiv';
import { upsertContact, setAcquisitionIfEmpty } from '@/lib/crm/contacts';
import { readAttribution, sourceFromAttribution } from '@/lib/crm/attribution';
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

  // Someone who only ever subscribes still belongs in the contacts table, so
  // the CRM knows them. Their consent stays pending until beehiiv confirms the
  // double opt-in, and the worker leaves a pending contact alone.
  const attribution = readAttribution(
    {
      utm_source: String(formData.get('utm_source') || ''),
      utm_medium: String(formData.get('utm_medium') || ''),
      utm_campaign: String(formData.get('utm_campaign') || ''),
    },
    String(formData.get('referrer') || '') || null
  );
  const acquisition = sourceFromAttribution(attribution);

  after(async () => {
    const contactId = await upsertContact({
      email,
      source: 'newsletter',
      patch: { newsletter_opt_in: true, newsletter_status: 'pending' },
    });
    // First touch wins, so this only fills an empty source.
    if (contactId && acquisition) await setAcquisitionIfEmpty(contactId, acquisition);
  });

  return { status: 'ok' };
}
