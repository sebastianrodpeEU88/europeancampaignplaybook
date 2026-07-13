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
      <h1 className="text-3xl sm:text-4xl font-bold text-[#2B0A2E] leading-tight mb-3">
        {article.title}
      </h1>
      <p className="text-lg text-[#7A6380] leading-relaxed">
        {article.subheadline}
      </p>
    </header>
  );
}
