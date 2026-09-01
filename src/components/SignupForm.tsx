'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signUp } from '@/lib/auth-actions';
import { idleAuthState } from '@/lib/auth-state';
import { routes } from '@/lib/routes';
import Turnstile from '@/components/Turnstile';

const inputClasses =
  'w-full rounded-[2px] border border-rule/25 bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink';

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, idleAuthState);

  if (state.status === 'check-email') {
    return (
      <div className="rounded-[2px] border border-rule/20 bg-paper p-6">
        <p className="font-semibold text-ink mb-1">Check your email</p>
        <p className="text-sm text-ink/60">
          Confirm your address to finish creating your account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form action={formAction} className="rounded-[2px] border border-rule/20 bg-paper p-6 space-y-4">
        {/* Honeypot — hidden from real users; bots that fill it are dropped server-side. */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="website">Leave this field empty</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-ink/80 mb-1">
              First name
            </label>
            <input id="first_name" name="first_name" required autoComplete="given-name" className={inputClasses} />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-ink/80 mb-1">
              Last name
            </label>
            <input id="last_name" name="last_name" required autoComplete="family-name" className={inputClasses} />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink/80 mb-1">
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink/80 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClasses}
          />
          <p className="mt-1 text-xs text-ink/45">At least 8 characters.</p>
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
          {pending ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <p className="text-center text-sm text-ink/60">
        Already have an account?{' '}
        <Link href={routes.login()} className="text-ink underline hover:no-underline font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
