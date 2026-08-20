import type { Metadata } from 'next';
import { getAllArticleSummaries, getAllAuthors, getAllPillars } from '@/lib/content';
import Container from '@/components/Container';
import ArticleList from '@/components/ArticleList';

export const metadata: Metadata = {
  title: 'articles',
  description: 'Browse all practitioner articles across european campaign playbook — filter by pillar, article type, difficulty, and jurisdiction.',
};

export default async function ArticlesPage() {
  const [articles, authors, pillars] = await Promise.all([
    getAllArticleSummaries(),
    getAllAuthors(),
    getAllPillars(),
  ]);

  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="mb-8">
          <h1 className="display text-3xl text-ink mb-2">articles</h1>
          <p className="text-ink/60">
            {articles.length} practitioner articles across 16 knowledge pillars.
          </p>
        </div>
        <ArticleList articles={articles} authors={authors} pillars={pillars} />
      </Container>
    </div>
  );
}
