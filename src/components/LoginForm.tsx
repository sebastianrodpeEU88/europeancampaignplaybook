'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { logIn, sendMagicLink } from '@/lib/auth-actions';
import { idleAuthState } from '@/lib/auth-state';
import { routes } from '@/lib/routes';
import Turnstile from '@/components/Turnstile';

const inputClasses =
  'w-full rounded-[2px] border border-rule/25 bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink';

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [passwordState, passwordAction, passwordPending] = useActionState(logIn, idleAuthState);
  const [magicState, magicAction, magicPending] = useActionState(sendMagicLink, idleAuthState);

  if (magicState.status === 'check-email') {
    return (
      <div className="rounded-[2px] border border-rule/20 bg-paper p-6">
        <p className="font-semibold text-ink mb-1">Check your email</p>
        <p className="text-sm text-ink/60">
          We sent a sign-in link — click it to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form action={passwordAction} className="rounded-[2px] border border-rule/20 bg-paper p-6 space-y-4">
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
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
            autoComplete="current-password"
            className={inputClasses}
          />
        </div>
        {passwordState.status === 'error' && (
          <p className="text-sm text-series-02-narrative" role="alert">
            {passwordState.message}
          </p>
        )}
        <Turnstile resetSignal={passwordState} />
        <button
          type="submit"
          disabled={passwordPending}
          className="w-full rounded-[2px] bg-navy px-4 py-2.5 text-sm font-semibold text-[#EDE7DA] hover:bg-[#0A1D2B]/85 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
        >
          {passwordPending ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <form action={magicAction} className="rounded-[2px] border border-rule/20 bg-paper p-6 space-y-3">
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
        <p className="text-sm text-ink/60">Or get a one-time sign-in link by email</p>
        <div className="flex gap-2">
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
            className={inputClasses}
          />
          <button
            type="submit"
            disabled={magicPending}
            className="flex-shrink-0 rounded-[2px] border border-rule/25 px-4 py-2 text-sm font-medium text-ink/80 hover:bg-ink/[0.03] transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            {magicPending ? 'Sending…' : 'Send link'}
          </button>
        </div>
        <Turnstile resetSignal={magicState} />
        {magicState.status === 'error' && (
          <p className="text-sm text-series-02-narrative" role="alert">
            {magicState.message}
          </p>
        )}
      </form>

      <p className="text-center text-sm text-ink/60">
        No account yet?{' '}
        <Link href={routes.signup()} className="text-ink underline hover:no-underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
