import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin';
import { notionHealth } from '@/lib/integrations/notion';
import { beehiivHealth } from '@/lib/integrations/beehiiv';

// Admin-only connectivity check for the Beehiiv + Notion integrations. Visit
// /api/admin/integrations/health while signed in as an admin to confirm both
// keys/IDs are set and the credentials actually reach each service.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: 'not authorized' }, { status: 404 });
  }

  const env = {
    BEEHIIV_API_KEY: Boolean(process.env.BEEHIIV_API_KEY),
    BEEHIIV_PUBLICATION_ID: Boolean(process.env.BEEHIIV_PUBLICATION_ID),
    NOTION_API_KEY: Boolean(process.env.NOTION_API_KEY),
    NOTION_CRM_DATABASE_ID: Boolean(process.env.NOTION_CRM_DATABASE_ID),
  };

  const [notion, beehiiv] = await Promise.all([notionHealth(), beehiivHealth()]);

  return NextResponse.json({
    env,
    notion,
    beehiiv,
    ok: notion.ok && beehiiv.ok,
  });
}
