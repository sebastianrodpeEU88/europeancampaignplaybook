import type { Article, Pillar } from '@/types/content';
import MetadataChips from './MetadataChips';

export default function ArticleHeader({
  article,
  pillar,
}: {
  article: Article;
  pillar?: Pillar;
}) {
  return (
    <header className="mb-8">
      <MetadataChips article={article} pillar={pillar} />
      <h1 className="display text-3xl sm:text-4xl text-ink mb-3">
        {article.title}
      </h1>
      <p className="text-lg text-ink/60 leading-relaxed">
        {article.subheadline}
      </p>
    </header>
  );
}
