import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getAllArticles,
  getArticleBySlug,
  getAuthorById,
  getBreadcrumbForArticle,
  getPillarForArticle,
  getTopicBySlug,
  getArticlesByTopic,
} from '@/lib/content';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import ArticleHeader from '@/components/ArticleHeader';
import AuthorCard from '@/components/AuthorCard';
import ReviewerBadge from '@/components/ReviewerBadge';
import ComplianceNoteBox from '@/components/ComplianceNote';
import Paywall from '@/components/Paywall';
import SubscribeCTA from '@/components/SubscribeCTA';
import SidebarTaxonomy from '@/components/SidebarTaxonomy';
import Link from 'next/link';

// Hardcoded — will be replaced by Stripe/auth session check
const hasAccess = false;

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((a) => ({ articleSlug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ articleSlug: string }>;
}): Promise<Metadata> {
  const { articleSlug } = await params;
  const article = getArticleBySlug(articleSlug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.subheadline,
    openGraph: {
      title: article.title,
      description: article.subheadline,
      type: 'article',
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ articleSlug: string }>;
}) {
  const { articleSlug } = await params;
  const article = getArticleBySlug(articleSlug);
  if (!article) notFound();

  const author = getAuthorById(article.authorId);
  const pillar = getPillarForArticle(article);
  const breadcrumbs = getBreadcrumbForArticle(article);
  const isLocked = article.locked && !hasAccess;
  const relatedArticles = article.relatedTopicSlugs
    .flatMap((slug) => getArticlesByTopic(slug))
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  return (
    <div className="bg-[#F8F7F3] min-h-screen py-12">
      <Container>
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
          {/* Main content */}
          <article className="min-w-0">
            {/* 1. Breadcrumbs */}
            <Breadcrumbs items={breadcrumbs} />

            {/* 2-3. ArticleHeader (type chip, difficulty, h1, subheadline) + MetadataChips */}
            <ArticleHeader article={article} pillar={pillar} />

            {/* 4. Author card */}
            {author && <AuthorCard author={author} />}

            {/* 5. Reviewer badge */}
            {article.reviewer && <ReviewerBadge reviewer={article.reviewer} />}

            {/* 6. Opinion flag */}
            {article.type === 'Opinion essay' && (
              <aside className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#FFFBF0] p-4 my-4">
                <p className="text-sm font-medium text-[#92400E]">
                  This is an opinion essay. The views expressed are those of the author and do
                  not represent the editorial position of the Campaign Intelligence Library.
                </p>
              </aside>
            )}

            {/* 7. What/who/when summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              {[
                { label: 'What it covers', value: article.whatItCovers },
                { label: 'Who it is for', value: article.whoItIsFor },
                { label: 'When to use it', value: article.whenToUseIt },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                    {label}
                  </p>
                  <p className="text-sm text-[#374151] leading-relaxed">{value}</p>
                </div>
              ))}
            </div>

            {/* 8. Key takeaway */}
            <blockquote className="rounded-xl border-l-4 border-[#1C1C1E] bg-white p-5 my-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                Key takeaway
              </p>
              <p className="text-base font-medium text-[#1C1C1E] leading-relaxed italic">
                "{article.keyTakeaway}"
              </p>
            </blockquote>

            {/* 9. In brief */}
            <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-5 my-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">
                In brief
              </p>
              <ul className="space-y-2">
                {article.inBrief.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#374151]">
                    <span
                      className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-[#9CA3AF] mt-2"
                      aria-hidden="true"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* 10. Key framework */}
            {article.keyFramework && (
              <div className="my-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                  Framework
                </p>
                <h2 className="text-lg font-bold text-[#1C1C1E] mb-1">
                  {article.keyFramework.name}
                </h2>
                <p className="text-sm text-[#6B7280] mb-4">{article.keyFramework.description}</p>
                <div className="overflow-x-auto rounded-xl border border-[rgba(0,0,0,0.08)] bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(0,0,0,0.06)]">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider w-1/3">
                          Layer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider w-1/6">
                          Label
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(0,0,0,0.04)]">
                      {article.keyFramework.rows.map(([name, label, desc], i) => (
                        <tr key={i} className="hover:bg-[rgba(0,0,0,0.01)]">
                          <td className="px-4 py-3 font-medium text-[#1C1C1E]">{name}</td>
                          <td className="px-4 py-3 text-[#6B7280]">{label}</td>
                          <td className="px-4 py-3 text-[#374151]">{desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 11. Preview section */}
            <section
              aria-labelledby={`preview-section-${article.slug}`}
              className="relative prose-article my-8"
            >
              <h2
                id={`preview-section-${article.slug}`}
                className="text-xl font-bold text-[#1C1C1E] mb-4"
              >
                {article.previewSection.title}
              </h2>
              {article.previewSection.paragraphs.map((para, i) => (
                <p key={i} className="text-[#374151] leading-relaxed mb-4">
                  {para}
                </p>
              ))}
            </section>

            {/* 12. Paywall or full content */}
            {isLocked ? (
              <Paywall />
            ) : (
              <>
                {/* Full sections */}
                {article.fullSections.map((section, i) => (
                  <section key={i} aria-labelledby={`section-${i}`} className="prose-article my-8">
                    <h2 id={`section-${i}`} className="text-xl font-bold text-[#1C1C1E] mb-4">
                      {section.title}
                    </h2>
                    {section.paragraphs.map((para, j) => (
                      <p key={j} className="text-[#374151] leading-relaxed mb-4">
                        {para}
                      </p>
                    ))}
                  </section>
                ))}

                {/* AI workflow */}
                {article.aiWorkflow && article.aiWorkflow.length > 0 && (
                  <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-5 my-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">
                      AI workflow suggestions
                    </p>
                    <ul className="space-y-2">
                      {article.aiWorkflow.map((step, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-[#374151]">
                          <span className="flex-shrink-0 font-medium text-[#9CA3AF]">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prompt pack */}
                {article.promptPack && article.promptPack.length > 0 && (
                  <div className="my-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">
                      Prompt pack
                    </p>
                    <div className="space-y-3">
                      {article.promptPack.map((item, i) => (
                        <div key={i} className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-4">
                          <p className="text-sm font-semibold text-[#1C1C1E] mb-2">{item.title}</p>
                          <pre className="text-xs text-[#374151] bg-[#F8F7F3] rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                            {item.prompt}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Checklist */}
                {article.checklist && article.checklist.length > 0 && (
                  <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-5 my-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">
                      Checklist
                    </p>
                    <ul className="space-y-2">
                      {article.checklist.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-[#374151]">
                          <svg className="h-4 w-4 text-[#3B6D11] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* 14. Compliance note — ALWAYS rendered */}
            {article.complianceBox && (
              <ComplianceNoteBox note={article.complianceBox} />
            )}

            {/* 15. Sources, further reading, related topics, version history — only when unlocked */}
            {!isLocked && (
              <>
                {/* Sources */}
                {article.sources.length > 0 && (
                  <div className="my-8 pt-8 border-t border-[rgba(0,0,0,0.06)]">
                    <h2 className="text-base font-semibold text-[#1C1C1E] mb-3">Sources</h2>
                    <ol className="space-y-1">
                      {article.sources.map((source, i) => (
                        <li key={i} className="text-sm text-[#6B7280] flex gap-2">
                          <span className="text-[#9CA3AF] flex-shrink-0">{i + 1}.</span>
                          {source}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Further reading */}
                {article.furtherReading.length > 0 && (
                  <div className="my-6">
                    <h2 className="text-base font-semibold text-[#1C1C1E] mb-3">Further reading</h2>
                    <ul className="space-y-2">
                      {article.furtherReading.map((item, i) => (
                        <li key={i} className="flex items-center gap-3 rounded-lg border border-[rgba(0,0,0,0.08)] bg-white p-3 text-sm">
                          <span className="rounded-full bg-[rgba(0,0,0,0.05)] px-2 py-0.5 text-xs text-[#6B7280] flex-shrink-0">
                            {item.type}
                          </span>
                          <span className="text-[#374151] flex-1">{item.title}</span>
                          <span className="text-xs text-[#9CA3AF] flex-shrink-0">{item.readingTime} min</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Related topics */}
                {article.relatedTopicSlugs.length > 0 && (
                  <div className="my-6">
                    <h2 className="text-base font-semibold text-[#1C1C1E] mb-3">Related topics</h2>
                    <div className="flex flex-wrap gap-2">
                      {article.relatedTopicSlugs.map((slug) => (
                        <Link
                          key={slug}
                          href={routes.topic(slug)}
                          className="rounded-full border border-[rgba(0,0,0,0.12)] bg-white px-3 py-1 text-sm text-[#374151] hover:bg-[rgba(0,0,0,0.03)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#185FA5]"
                        >
                          {slug.replace(/-/g, ' ')}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Version history */}
                {article.versionHistory.length > 0 && (
                  <div className="my-6 pt-6 border-t border-[rgba(0,0,0,0.06)]">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">
                      Version history
                    </h2>
                    <ul className="space-y-1">
                      {article.versionHistory.map((entry, i) => (
                        <li key={i} className="text-xs text-[#9CA3AF] flex gap-3">
                          <span className="font-mono">{entry.date}</span>
                          <span>{entry.note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Subscribe CTA at bottom */}
            {isLocked && <SubscribeCTA />}
          </article>

          {/* Sticky right sidebar */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            {pillar && (
              <SidebarTaxonomy variant="article" pillar={pillar} article={article} />
            )}
          </aside>
        </div>
      </Container>
    </div>
  );
}
