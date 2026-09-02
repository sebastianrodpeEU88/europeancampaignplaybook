'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/lib/auth-actions';
import { idleAuthState } from '@/lib/auth-state';
import { routes } from '@/lib/routes';
import Turnstile from '@/components/Turnstile';

const inputClasses =
  'w-full rounded-[2px] border border-rule/25 bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink';

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, idleAuthState);

  if (state.status === 'check-email') {
    return (
      <div className="rounded-[2px] border border-rule/20 bg-paper p-6">
        <p className="font-semibold text-ink mb-1">Check your email</p>
        <p className="text-sm text-ink/60">
          If an account exists for that address, we&rsquo;ve sent a link to reset your password.
          Click it to choose a new one — and check your spam folder if it&rsquo;s not there.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form action={action} className="rounded-[2px] border border-rule/20 bg-paper p-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink/80 mb-1">
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClasses} />
        </div>
        {state.status === 'error' && (
          <p className="text-sm text-series-02-narrative" role="alert">
            {state.message}
          </p>
        )}
        <Turnstile resetSignal={state} />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-[2px] bg-navy px-4 py-2.5 text-sm font-semibold text-[#EDE7DA] hover:bg-[#0A1D2B]/85 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
        >
          {pending ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="text-center text-sm text-ink/60">
        Remembered it?{' '}
        <Link href={routes.login()} className="text-ink underline hover:no-underline font-medium">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
