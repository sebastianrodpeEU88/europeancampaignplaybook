import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Service-role client — bypasses Row Level Security. Server-only (used by
// the Stripe webhook handler to write subscription status). Never import
// this from a Client Component or expose SUPABASE_SERVICE_ROLE_KEY to the
// browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
