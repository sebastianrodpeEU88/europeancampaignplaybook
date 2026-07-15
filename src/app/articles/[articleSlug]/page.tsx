import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PortableText } from '@portabletext/react';
import {
  getAllArticles,
  getArticleBySlug,
  getAuthorById,
  getBreadcrumbForArticle,
  getPillarForArticle,
} from '@/lib/content';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import ArticleHeader from '@/components/ArticleHeader';
import AuthorCard from '@/components/AuthorCard';
import ReviewerBadge from '@/components/ReviewerBadge';
import ComplianceNoteBox from '@/components/ComplianceNote';
import GatedArticleSections from '@/components/GatedArticleSections';
import SubscribeCTA from '@/components/SubscribeCTA';
import SidebarTaxonomy from '@/components/SidebarTaxonomy';
import ArticleCover from '@/components/brand/ArticleCover';
import { portableTextComponents } from '@/components/portableTextComponents';
import Link from 'next/link';

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ articleSlug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ articleSlug: string }>;
}): Promise<Metadata> {
  const { articleSlug } = await params;
  const article = await getArticleBySlug(articleSlug);
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
  const article = await getArticleBySlug(articleSlug);
  if (!article) notFound();

  const [author, pillar, breadcrumbs] = await Promise.all([
    getAuthorById(article.authorId),
    getPillarForArticle(article),
    getBreadcrumbForArticle(article),
  ]);

  // No membership/session check here — this page has no dynamic API calls,
  // so it can be statically generated/ISR'd (see generateStaticParams
  // above). Gated content is fetched client-side, per-request, by
  // GatedArticleSections after a live auth check — see
  // src/app/api/articles/[articleSlug]/gated/route.ts. This keeps premium
  // content out of this page's static payload entirely for locked articles,
  // for every visitor, not just unauthorized ones.
  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
          {/* Main content */}
          <article className="min-w-0">
            {/* 1. Breadcrumbs */}
            <Breadcrumbs items={breadcrumbs} />

            {/* Cover */}
            <div className="mb-6">
              <ArticleCover
                title={article.title}
                pillarSlug={article.pillarSlug}
                coverImage={article.coverImage}
                priority
              />
            </div>

            {/* 2-3. ArticleHeader (type chip, difficulty, h1, subheadline) + MetadataChips */}
            <ArticleHeader article={article} pillar={pillar} />

            {/* 4. Author card */}
            {author && <AuthorCard author={author} />}

            {/* 5. Reviewer badge */}
            {article.reviewer && <ReviewerBadge reviewer={article.reviewer} />}

            {/* 6. Opinion flag */}
            {article.type === 'Opinion essay' && (
              <aside className="rounded-[2px] border border-rule/20 border-l-4 border-l-ink bg-ink/[0.03] p-4 my-4">
                <p className="text-sm font-medium text-ink/80">
                  This is an opinion essay. The views expressed are those of the author and do
                  not represent the editorial position of European Campaign Playbook.
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
                <div key={label} className="rounded-[2px] border border-rule/20 bg-paper p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-2">
                    {label}
                  </p>
                  <p className="text-sm text-ink/80 leading-relaxed">{value}</p>
                </div>
              ))}
            </div>

            {/* 8. Key takeaway */}
            <blockquote className="relative overflow-hidden rounded-[2px] border-l-4 border-ink bg-paper py-6 pl-6 pr-5 my-6">
              <span
                className="display absolute -top-3 left-4 text-7xl text-ghost leading-none select-none"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <p className="relative text-xs font-semibold uppercase tracking-wider text-ink/45 mb-2">
                Key takeaway
              </p>
              <p className="relative font-serif text-xl text-ink leading-snug">
                {article.keyTakeaway}
              </p>
            </blockquote>

            {/* 9. In brief */}
            <div className="rounded-[2px] border border-rule/20 bg-paper p-5 my-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-3">
                In brief
              </p>
              <ul className="space-y-2">
                {article.inBrief.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-ink/80">
                    <span
                      className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-ink/45 mt-2"
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
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-2">
                  Framework
                </p>
                <h2 className="display text-lg text-ink mb-1">
                  {article.keyFramework.name}
                </h2>
                <p className="text-sm text-ink/60 mb-4">{article.keyFramework.description}</p>
                <div className="overflow-x-auto rounded-[2px] border border-rule/20 bg-paper">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-rule/20">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-ink/45 uppercase tracking-wider w-1/3">
                          Layer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-ink/45 uppercase tracking-wider w-1/6">
                          Label
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-ink/45 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rule/10">
                      {article.keyFramework.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-ink/[0.02]">
                          <td className="px-4 py-3 font-medium text-ink">{row.layer}</td>
                          <td className="px-4 py-3 text-ink/60">{row.label}</td>
                          <td className="px-4 py-3 text-ink/80">{row.description}</td>
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
                className="display text-xl text-ink mb-4"
              >
                {article.previewSection.title}
              </h2>
              <PortableText value={article.previewSection.body} components={portableTextComponents} />
            </section>

            {/* 12. Paywall or full content */}
            {article.locked ? (
              <GatedArticleSections articleSlug={article.slug} />
            ) : (
              <>
                {/* Full sections */}
                {article.fullSections.map((section, i) => (
                  <section
                    key={i}
                    aria-labelledby={`section-${i}`}
                    className={`prose-article my-8 ${i > 0 ? 'pt-8 border-t border-rule/15' : ''}`}
                  >
                    <div className="flex items-baseline gap-4 mb-4">
                      <span
                        className="display text-4xl text-ghost leading-none flex-shrink-0"
                        aria-hidden="true"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h2 id={`section-${i}`} className="display text-xl text-ink">
                        {section.title}
                      </h2>
                    </div>
                    <PortableText value={section.body} components={portableTextComponents} />
                  </section>
                ))}

                {/* AI workflow */}
                {article.aiWorkflow && article.aiWorkflow.length > 0 && (
                  <div className="rounded-[2px] border border-rule/20 bg-paper p-5 my-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-3">
                      AI workflow suggestions
                    </p>
                    <ul className="space-y-2">
                      {article.aiWorkflow.map((step, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-ink/80">
                          <span className="flex-shrink-0 font-medium text-ink/45">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prompt pack */}
                {article.promptPack && article.promptPack.length > 0 && (
                  <div className="my-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-3">
                      Prompt pack
                    </p>
                    <div className="space-y-3">
                      {article.promptPack.map((item, i) => (
                        <div key={i} className="rounded-[2px] border border-rule/20 bg-paper p-4">
                          <p className="text-sm font-semibold text-ink mb-2">{item.title}</p>
                          <pre className="text-xs text-ink/80 bg-ink/[0.03] rounded-[2px] p-3 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                            {item.prompt}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Checklist */}
                {article.checklist && article.checklist.length > 0 && (
                  <div className="rounded-[2px] border border-rule/20 bg-paper p-5 my-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-3">
                      Checklist
                    </p>
                    <ul className="space-y-2">
                      {article.checklist.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-ink/80">
                          <svg className="h-4 w-4 text-ink flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {!article.locked && (
              <>
                {/* Sources */}
                {article.sources.length > 0 && (
                  <div className="my-8 pt-8 border-t border-rule/15">
                    <h2 className="display text-base text-ink mb-3">Sources</h2>
                    <ol className="space-y-1">
                      {article.sources.map((source, i) => (
                        <li key={i} className="text-sm text-ink/60 flex gap-2">
                          <span className="text-ink/45 flex-shrink-0">{i + 1}.</span>
                          {source}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Further reading */}
                {article.furtherReading.length > 0 && (
                  <div className="my-6">
                    <h2 className="display text-base text-ink mb-3">Further reading</h2>
                    <ul className="space-y-2">
                      {article.furtherReading.map((item, i) => (
                        <li key={i} className="flex items-center gap-3 rounded-[2px] border border-rule/20 bg-paper p-3 text-sm">
                          <span className="rounded-[2px] bg-ink/5 px-2 py-0.5 text-xs text-ink/60 flex-shrink-0">
                            {item.type}
                          </span>
                          <span className="text-ink/80 flex-1">{item.title}</span>
                          <span className="text-xs text-ink/45 flex-shrink-0">{item.readingTime} min</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Related topics */}
                {article.relatedTopicSlugs.length > 0 && (
                  <div className="my-6">
                    <h2 className="display text-base text-ink mb-3">Related topics</h2>
                    <div className="flex flex-wrap gap-2">
                      {article.relatedTopicSlugs.map((slug) => (
                        <Link
                          key={slug}
                          href={routes.topic(slug)}
                          className="rounded-full border border-rule/25 bg-paper px-3 py-1 text-sm text-ink/80 hover:bg-ink/[0.03] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                        >
                          {slug.replace(/-/g, ' ')}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Version history */}
                {article.versionHistory.length > 0 && (
                  <div className="my-6 pt-6 border-t border-rule/15">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-3">
                      Version history
                    </h2>
                    <ul className="space-y-1">
                      {article.versionHistory.map((entry, i) => (
                        <li key={i} className="text-xs text-ink/45 flex gap-3">
                          <span>{entry.date}</span>
                          <span>{entry.note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Subscribe CTA at bottom */}
            {article.locked && <SubscribeCTA />}
          </article>

          {/* Sticky right sidebar */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            {pillar && (
              <SidebarTaxonomy
                variant="article"
                pillar={pillar}
                article={{
                  readingTime: article.readingTime,
                  difficulty: article.difficulty,
                  jurisdiction: article.jurisdiction,
                  lastUpdated: article.lastUpdated,
                  type: article.type,
                  topicSlug: article.topicSlug,
                }}
              />
            )}
          </aside>
        </div>
      </Container>
    </div>
  );
}
