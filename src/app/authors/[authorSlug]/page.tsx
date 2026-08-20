import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getAllAuthors,
  getAuthorBySlug,
  getArticleSummariesByAuthor,
  getAllPillars,
} from '@/lib/content';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import AuthorCard from '@/components/AuthorCard';
import ArticleCard from '@/components/ArticleCard';

export async function generateStaticParams() {
  const authors = await getAllAuthors();
  return authors.map((a) => ({ authorSlug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ authorSlug: string }>;
}): Promise<Metadata> {
  const { authorSlug } = await params;
  const author = await getAuthorBySlug(authorSlug);
  if (!author) return {};
  return {
    title: author.name,
    description: author.bio || `Articles by ${author.name} on european campaign playbook.`,
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ authorSlug: string }>;
}) {
  const { authorSlug } = await params;
  const author = await getAuthorBySlug(authorSlug);
  if (!author) notFound();

  const [articles, pillars] = await Promise.all([
    getArticleSummariesByAuthor(authorSlug),
    getAllPillars(),
  ]);
  const pillarMap = new Map(pillars.map((p) => [p.slug, p]));

  const breadcrumbs = [
    { label: 'Contributors', href: routes.contributors() },
    { label: author.name, href: routes.author(author.slug) },
  ];

  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs items={breadcrumbs} />

          <AuthorCard author={author} />

          <h2 className="display text-xl text-ink mt-8 mb-4">
            {articles.length === 1 ? '1 article' : `${articles.length} articles`}
          </h2>

          {articles.length === 0 ? (
            <div className="rounded-[2px] border border-rule/20 bg-paper p-12 text-center">
              <p className="text-ink/60">No articles published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  author={author}
                  pillar={pillarMap.get(article.pillarSlug)}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
