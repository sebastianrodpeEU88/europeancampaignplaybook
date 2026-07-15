import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GDPR Art. 20 (data portability): lets a logged-in user download everything
// we hold on them. Auth is via the session cookie only — no user id is ever
// accepted from the request, so this can only ever return the caller's own data.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, billing_interval, status, current_period_end, created_at, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      emailConfirmedAt: user.email_confirmed_at,
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at,
    },
    membership: subscription ?? null,
  };

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="my-data.json"',
    },
  });
}
