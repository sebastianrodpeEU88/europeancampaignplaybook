import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUpcomingEvents } from '@/lib/content';
import { sendReminderEmail } from '@/lib/email';

// Scheduled by vercel.json ("crons"). Vercel adds Authorization: Bearer
// ${CRON_SECRET} to the request when CRON_SECRET is set. Finds events starting
// within the reminder window and emails registrants who haven't been reminded,
// marking each so nobody gets a duplicate (safe to run repeatedly).
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ message: 'CRON_SECRET is not set' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const windowHours = Number(process.env.REMINDER_WINDOW_HOURS || '48');
  const now = Date.now();
  const cutoff = now + windowHours * 3_600_000;

  const events = await getUpcomingEvents();
  const soon = events.filter((e) => {
    const start = new Date(e.startDateTime).getTime();
    return start > now && start <= cutoff;
  });

  const admin = createAdminClient();
  let sent = 0;
  const results: { slug: string; sent: number }[] = [];

  for (const event of soon) {
    const { data: regs } = await admin
      .from('event_registrations')
      .select('user_id')
      .eq('event_slug', event.slug)
      .is('reminded_at', null);
    if (!regs || regs.length === 0) continue;

    let eventSent = 0;
    for (const reg of regs) {
      const { data: userRes } = await admin.auth.admin.getUserById(reg.user_id);
      const email = userRes?.user?.email;
      if (!email) continue;

      const ok = await sendReminderEmail(email, {
        slug: event.slug,
        title: event.title,
        summary: event.summary,
        location: event.location,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
      });
      if (ok) {
        await admin
          .from('event_registrations')
          .update({ reminded_at: new Date().toISOString() })
          .eq('user_id', reg.user_id)
          .eq('event_slug', event.slug);
        eventSent += 1;
        sent += 1;
      }
    }
    results.push({ slug: event.slug, sent: eventSent });
  }

  return NextResponse.json({ ok: true, windowHours, eventsInWindow: soon.length, sent, results });
}
