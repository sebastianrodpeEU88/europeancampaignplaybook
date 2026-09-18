'use client';

import { useState, useTransition } from 'react';
import { sendConfirmationReminderPreview } from '@/lib/admin-actions';

// Sends the admin the exact final reminder, dated as if they had signed up on
// `signedUpAt`, so the wording can be checked before anyone receives it.
export default function ReminderPreviewButton({ signedUpAt }: { signedUpAt: string }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  function send() {
    setStatus(null);
    startTransition(async () => {
      const result = await sendConfirmationReminderPreview(signedUpAt);
      setStatus(result.ok ? 'Preview sent to your inbox.' : result.error);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={send}
        disabled={pending}
        className="rounded-[2px] border border-rule/30 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-ink/5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        {pending ? 'Sending…' : 'Send me a preview'}
      </button>
      {status && <span className="text-xs text-ink/60">{status}</span>}
    </div>
  );
}
