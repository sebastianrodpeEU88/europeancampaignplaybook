import type { Metadata } from 'next';
import { getAllAuthors } from '@/lib/content';
import Container from '@/components/Container';
import AuthorCard from '@/components/AuthorCard';

export const metadata: Metadata = {
  title: 'contributors',
  description: 'Meet the practitioners, researchers, and legal experts who contribute to European Campaign Playbook.',
};

export default async function ContributorsPage() {
  const authors = await getAllAuthors();

  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="display text-3xl text-ink mb-2">contributors</h1>
            <p className="text-ink/60 leading-relaxed max-w-2xl">
              European Campaign Playbook is built on the expertise of EU-based practitioners,
              researchers, and legal specialists. Every contributor provides a disclosure statement and
              every regulatory article is peer-reviewed.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {authors.map((author) => (
              <AuthorCard key={author.id} author={author} linkName />
            ))}
          </div>

          {/* Contributor model */}
          <div className="mt-12 rounded-[2px] border border-rule/20 bg-paper p-8">
            <h2 className="display text-xl text-ink mb-4">contributor model</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-ink/80">
              <div>
                <p className="font-semibold text-ink mb-1">Editorial independence</p>
                <p className="text-ink/60 leading-relaxed">
                  All contributors write independently. The Library does not accept commissioned
                  content from vendors or commercial interests.
                </p>
              </div>
              <div>
                <p className="font-semibold text-ink mb-1">Mandatory disclosure</p>
                <p className="text-ink/60 leading-relaxed">
                  Every contributor provides a disclosure statement that is published alongside
                  their articles. Undisclosed conflicts are grounds for removal.
                </p>
              </div>
              <div>
                <p className="font-semibold text-ink mb-1">Peer review</p>
                <p className="text-ink/60 leading-relaxed">
                  Legal briefings and articles touching regulation are peer-reviewed by an
                  independent specialist before publication.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
