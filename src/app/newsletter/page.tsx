import type { Metadata } from 'next';
import Container from '@/components/Container';
import NewsletterForm from '@/components/NewsletterForm';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'join the mailing list',
  description:
    'Get european campaign playbook in your inbox — new workshops, articles, and practical campaign craft for pro-European campaigners and public affairs teams.',
  alternates: { canonical: routes.newsletter() },
};

export default function NewsletterPage() {
  return (
    <div className="bg-paper min-h-screen py-16">
      <Container>
        <div className="max-w-xl mx-auto text-center">
          <h1 className="display text-3xl sm:text-4xl text-ink mb-3">join the mailing list</h1>
          <p className="text-ink/65 leading-relaxed mb-8">
            New workshops, fresh articles, and practical campaign craft — straight to your inbox.
            For campaigners, public affairs and policy people working on Europe.
          </p>
          <div className="text-left">
            <NewsletterForm />
          </div>
        </div>
      </Container>
    </div>
  );
}
