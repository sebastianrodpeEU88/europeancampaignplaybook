import { NextResponse } from 'next/server';
import { getArticleBySlug } from '@/lib/content';
import { hasActiveMembership } from '@/lib/membership';

// Serves the fields gated behind membership. Kept out of the article page's
// own render tree (see src/app/articles/[articleSlug]/page.tsx) so that page
// can be statically generated/ISR'd — only this route touches cookies() and
// runs per-request. Locked-article premium content only ever leaves the
// server through here, after a live auth check.
export async function GET(_request: Request, ctx: RouteContext<'/api/articles/[articleSlug]/gated'>) {
  const { articleSlug } = await ctx.params;
  const article = await getArticleBySlug(articleSlug);

  if (!article) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  const hasAccess = !article.locked || (await hasActiveMembership());
  if (!hasAccess) {
    return NextResponse.json({ locked: true }, { status: 403 });
  }

  return NextResponse.json({
    fullSections: article.fullSections,
    aiWorkflow: article.aiWorkflow ?? [],
    promptPack: article.promptPack ?? [],
    checklist: article.checklist ?? [],
    sources: article.sources,
    furtherReading: article.furtherReading,
    relatedTopicSlugs: article.relatedTopicSlugs,
    versionHistory: article.versionHistory,
  });
}
