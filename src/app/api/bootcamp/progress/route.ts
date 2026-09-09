import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Bootcamp progress for the signed-in user. Kept as a route (rather than a
// server action embedded in the page) because article pages are statically
// generated — the button fetches its own state per request.

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ signedIn: false, completed: [] });

  const { data, error } = await supabase
    .from('bootcamp_progress')
    .select('article_slug');

  // The table may not exist yet on a fresh environment — degrade to "nothing
  // completed" rather than breaking the article page.
  if (error) return NextResponse.json({ signedIn: true, completed: [], unavailable: true });

  return NextResponse.json({
    signedIn: true,
    completed: (data ?? []).map((r) => r.article_slug as string),
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });

  const body = (await request.json()) as {
    articleSlug?: string;
    bootcampSlug?: string;
    articleTitle?: string;
    episodeLabel?: string;
    completed?: boolean;
  };

  if (!body.articleSlug) {
    return NextResponse.json({ message: 'articleSlug is required' }, { status: 400 });
  }

  if (body.completed === false) {
    const { error } = await supabase
      .from('bootcamp_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('article_slug', body.articleSlug);
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ completed: false });
  }

  const { error } = await supabase.from('bootcamp_progress').upsert(
    {
      user_id: user.id,
      article_slug: body.articleSlug,
      bootcamp_slug: body.bootcampSlug ?? null,
      article_title: body.articleTitle ?? null,
      episode_label: body.episodeLabel ?? null,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,article_slug' }
  );
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ completed: true });
}
