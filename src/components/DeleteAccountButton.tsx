'use client';

import { useState, useTransition } from 'react';
import { requestAccountDeletion } from '@/lib/gdpr-actions';

const CONFIRM_PHRASE = 'DELETE';

export default function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm text-series-02-narrative hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-series-02-narrative rounded"
      >
        Delete account
      </button>
    );
  }

  return (
    <div className="rounded-[2px] border border-series-02-narrative/30 bg-series-02-narrative/5 p-4 space-y-3">
      <p className="text-sm text-ink">
        This locks your account immediately — you won&apos;t be able to log back in. We retain
        billing and invoice records as required by tax law, then complete deletion of your
        personal data afterwards. Type <strong>{CONFIRM_PHRASE}</strong> to confirm.
      </p>
      <input
        value={confirmText}
        onChange={(event) => setConfirmText(event.target.value)}
        placeholder={CONFIRM_PHRASE}
        aria-label={`Type ${CONFIRM_PHRASE} to confirm account deletion`}
        className="w-full rounded-[2px] border border-rule/25 bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-series-02-narrative"
      />
      <div className="flex gap-3">
        <button
          type="button"
          disabled={confirmText !== CONFIRM_PHRASE || isPending}
          onClick={() => startTransition(() => { void requestAccountDeletion(); })}
          className="rounded-[2px] bg-series-02-narrative px-4 py-2 text-sm font-semibold text-[#EDE7DA] hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-series-02-narrative focus-visible:ring-offset-2"
        >
          {isPending ? 'Submitting…' : 'Request account deletion'}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setConfirmText('');
          }}
          disabled={isPending}
          className="text-sm text-ink/60 hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
