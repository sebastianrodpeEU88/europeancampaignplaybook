'use client';

import { useState, useTransition } from 'react';
import { sendConfirmationReminder } from '@/lib/admin-actions';

// `recentlyReminded` is worked out on the server, so the button never reads
// the clock while rendering.
export default function SendReminderButton({
  userId,
  recentlyReminded,
}: {
  userId: string;
  recentlyReminded: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coolingDown = recentlyReminded || sent;

  function send() {
    setError(null);
    startTransition(async () => {
      const result = await sendConfirmationReminder(userId);
      if (result.ok) setSent(true);
      else setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={send}
        disabled={pending || coolingDown}
        className="rounded-[2px] bg-navy px-3 py-1.5 text-xs font-semibold text-[#EDE7DA] hover:bg-navy/85 transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        {pending ? 'Sending…' : coolingDown ? 'Reminder sent' : 'Send reminder'}
      </button>
      {error && <span className="text-xs text-[#dd3c13]">{error}</span>}
    </div>
  );
}
