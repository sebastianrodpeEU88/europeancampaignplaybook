import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Refreshes the Supabase session cookie on every request. Named `proxy`
// (not `middleware`) — this Next.js version renamed the file convention.
// See node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
// Canonical domain. The production *.vercel.app URL serves an identical copy of
// the site; redirect it here so search engines index one domain, not two.
const CANONICAL_HOST = 'www.campaignplaybook.eu';
const REDIRECT_FROM_HOST = 'europeancampaignplaybook.vercel.app';

export async function proxy(request: NextRequest) {
  // Consolidate to the branded domain for SEO. Only the exact production Vercel
  // host is redirected — hashed preview deployments and localhost are left alone
  // so they stay testable.
  if (request.headers.get('host') === REDIRECT_FROM_HOST) {
    const target = request.nextUrl.clone();
    target.protocol = 'https:';
    target.host = CANONICAL_HOST;
    target.port = '';
    return NextResponse.redirect(target, 308);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Supabase isn't configured yet (e.g. mid-setup) — pass every request
  // through rather than crashing the whole site.
  if (!url || !anonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Touching auth.getUser() is what actually refreshes an expiring session.
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
