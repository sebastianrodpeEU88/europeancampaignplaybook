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
      <h1 className="text-3xl sm:text-4xl font-bold text-[#1C1C1E] leading-tight mb-3">
        {article.title}
      </h1>
      <p className="text-lg text-[#6B7280] leading-relaxed">
        {article.subheadline}
      </p>
    </header>
  );
}
