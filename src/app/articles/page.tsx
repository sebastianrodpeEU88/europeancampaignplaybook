import type { Metadata } from 'next';
import { getAllArticles, getAllAuthors, getAllPillars } from '@/lib/content';
import Container from '@/components/Container';
import ArticleList from '@/components/ArticleList';

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Browse all practitioner articles across the Campaign Intelligence Library — filter by pillar, article type, difficulty, and jurisdiction.',
};

export default function ArticlesPage() {
  const articles = getAllArticles();
  const authors = getAllAuthors();
  const pillars = getAllPillars();

  return (
    <div className="bg-[#F8F7F3] min-h-screen py-12">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1C1C1E] mb-2">Articles</h1>
          <p className="text-[#6B7280]">
            {articles.length} practitioner articles across 16 knowledge pillars.
          </p>
        </div>
        <ArticleList articles={articles} authors={authors} pillars={pillars} />
      </Container>
    </div>
  );
}
