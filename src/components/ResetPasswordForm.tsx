'use client';

import { useActionState, useState } from 'react';
import { updatePassword } from '@/lib/auth-actions';
import { idleAuthState } from '@/lib/auth-state';

const inputClasses =
  'w-full rounded-[2px] border border-rule/25 bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink';

export default function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, idleAuthState);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const mismatch = confirm.length > 0 && pw !== confirm;

  return (
    <form action={action} className="rounded-[2px] border border-rule/20 bg-paper p-6 space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink/80 mb-1">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className={inputClasses}
        />
        <p className="mt-1 text-xs text-ink/45">At least 8 characters.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-ink/80 mb-1">
          Confirm new password
        </label>
        <input
          id="confirm"
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClasses}
        />
        {mismatch && <p className="mt-1 text-xs text-series-02-narrative">Passwords don&rsquo;t match.</p>}
      </div>
      {state.status === 'error' && (
        <p className="text-sm text-series-02-narrative" role="alert">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || mismatch || pw.length < 8}
        className="w-full rounded-[2px] bg-navy px-4 py-2.5 text-sm font-semibold text-[#EDE7DA] hover:bg-[#0A1D2B]/85 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
      >
        {pending ? 'Saving…' : 'Set new password'}
      </button>
    </form>
  );
}
