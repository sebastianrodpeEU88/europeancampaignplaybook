'use client';

import { useState, useTransition } from 'react';
import { sendConfirmationReminder } from '@/lib/admin-actions';

// Each person gets one final reminder; after that the button stays disabled.
export default function SendReminderButton({
  userId,
  alreadyReminded,
}: {
  userId: string;
  alreadyReminded: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const done = alreadyReminded || sent;

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
        disabled={pending || done}
        className="rounded-[2px] bg-navy px-3 py-1.5 text-xs font-semibold text-[#EDE7DA] hover:bg-navy/85 transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        {pending ? 'Sending…' : done ? 'Final reminder sent' : 'Send final reminder'}
      </button>
      {error && <span className="text-xs text-[#dd3c13]">{error}</span>}
    </div>
  );
}
