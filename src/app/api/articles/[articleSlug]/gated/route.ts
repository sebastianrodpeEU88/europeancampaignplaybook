import { NextResponse } from 'next/server';
import { getArticleBySlug } from '@/lib/content';
import { hasActiveMembership } from '@/lib/membership';
import { createClient } from '@/lib/supabase/server';

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

  // 'Account' articles (bootcamp episodes) are free — they only need a
  // signed-in user. 'Members' still needs a paid membership.
  let hasAccess: boolean;
  if (article.access === 'Account') {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    hasAccess = !!user;
  } else if (article.access === 'Members') {
    hasAccess = await hasActiveMembership();
  } else {
    hasAccess = true;
  }

  if (!hasAccess) {
    return NextResponse.json({ locked: true, access: article.access }, { status: 403 });
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
