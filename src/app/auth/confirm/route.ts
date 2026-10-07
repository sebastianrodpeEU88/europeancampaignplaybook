import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { pathAfterSignIn, AFTER_SIGNIN_COOKIE } from '@/lib/auth-redirect';
import { routes } from '@/lib/routes';


// Where emailed sign-in links land.
//
// A GET renders a page with a button; the sign-in happens on the POST behind
// it. That one extra click is deliberate. Corporate and NGO mail security
// opens every link in a message before the person does, and these tokens are
// single use, so a scanner that merely fetches the URL burns the link and the
// recipient is left asking for another one for ever. Scanners follow links;
// they do not submit forms.
//
// The token never reaches the page's JavaScript: it travels in a hidden field
// and is verified server-side.

const SAFE_NEXT = (value: string | null): string =>
  value?.startsWith('/') && !value.startsWith('//') ? value : routes.account();

function page(tokenHash: string, type: string, next: string, origin: string): string {
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Sign in · european campaign playbook</title>
<style>
  :root { color-scheme: light; }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         background:#EDE7DA; color:#14202A;
         font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }
  main { max-width:26rem; padding:2.5rem 2rem; text-align:left; }
  h1 { font-size:1.5rem; margin:0 0 .75rem; }
  p { margin:0 0 1.5rem; line-height:1.6; color:#4A5560; }
  button { background:#0A1D2B; color:#EDE7DA; border:0; border-radius:2px;
           padding:.85rem 1.5rem; font-size:1rem; cursor:pointer; }
  button:hover { background:#14202A; }
  small { display:block; margin-top:1.5rem; color:#6b7580; }
</style>
</head>
<body>
  <main>
    <h1>One more click</h1>
    <p>Press the button to sign in. We ask for this because some email systems
       open links automatically, which would use up your sign-in link before
       you got here.</p>
    <form method="post" action="${esc(origin)}/auth/confirm">
      <input type="hidden" name="token_hash" value="${esc(tokenHash)}">
      <input type="hidden" name="type" value="${esc(type)}">
      <input type="hidden" name="next" value="${esc(next)}">
      <button type="submit">Sign me in</button>
    </form>
    <small>If this link has already been used, ask for a new one on the log in page.</small>
  </main>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = SAFE_NEXT(searchParams.get('next'));

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}${routes.login()}?expired=1&redirectTo=${encodeURIComponent(next)}`);
  }

  return new NextResponse(page(tokenHash, type, next, origin), {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export async function POST(request: NextRequest) {
  const { origin } = new URL(request.url);
  const form = await request.formData();
  const tokenHash = String(form.get('token_hash') || '');
  const type = String(form.get('type') || '') as EmailOtpType;
  const next = SAFE_NEXT(String(form.get('next') || ''));

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      // The email always says next=/account, because the template cannot carry
      // a destination of its own. What they actually asked for is in the
      // cookie set when they requested the link, so that wins.
      const store = await cookies();
      const intended = SAFE_NEXT(store.get(AFTER_SIGNIN_COOKIE)?.value ?? null);
      const target = intended !== routes.account() ? intended : next;
      const res = NextResponse.redirect(`${origin}${await pathAfterSignIn(supabase, target)}`, { status: 303 });
      res.cookies.delete(AFTER_SIGNIN_COOKIE);
      return res;
    }
  }

  return NextResponse.redirect(
    `${origin}${routes.login()}?expired=1&redirectTo=${encodeURIComponent(next)}`,
    { status: 303 }
  );
}
