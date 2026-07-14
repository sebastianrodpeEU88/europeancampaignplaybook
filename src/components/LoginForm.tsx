'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { logIn, sendMagicLink } from '@/lib/auth-actions';
import { idleAuthState } from '@/lib/auth-state';
import { routes } from '@/lib/routes';

const inputClasses =
  'w-full rounded-lg border border-[rgba(43,10,46,0.15)] bg-white px-3 py-2 text-sm text-[#2B0A2E] placeholder:text-[#A896AC] focus:outline-none focus:ring-2 focus:ring-[#FF5B35]';

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [passwordState, passwordAction, passwordPending] = useActionState(logIn, idleAuthState);
  const [magicState, magicAction, magicPending] = useActionState(sendMagicLink, idleAuthState);

  if (magicState.status === 'check-email') {
    return (
      <div className="rounded-2xl border border-[rgba(43,10,46,0.1)] bg-white p-6">
        <p className="font-semibold text-[#2B0A2E] mb-1">Check your email</p>
        <p className="text-sm text-[#7A6380]">
          We sent a sign-in link — click it to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form action={passwordAction} className="rounded-2xl border border-[rgba(43,10,46,0.1)] bg-white p-6 space-y-4">
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#4A1F4D] mb-1">
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#4A1F4D] mb-1">
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
          <p className="text-sm text-[#B23A2E]" role="alert">
            {passwordState.message}
          </p>
        )}
        <button
          type="submit"
          disabled={passwordPending}
          className="w-full rounded-lg bg-[#2B0A2E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4A1F4D] transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] focus-visible:ring-offset-2"
        >
          {passwordPending ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <form action={magicAction} className="rounded-2xl border border-[rgba(43,10,46,0.1)] bg-white p-6 space-y-3">
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
        <p className="text-sm text-[#7A6380]">Or get a one-time sign-in link by email</p>
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
            className="flex-shrink-0 rounded-lg border border-[rgba(43,10,46,0.15)] px-4 py-2 text-sm font-medium text-[#4A1F4D] hover:bg-[#FDF6EC] transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35]"
          >
            {magicPending ? 'Sending…' : 'Send link'}
          </button>
        </div>
        {magicState.status === 'error' && (
          <p className="text-sm text-[#B23A2E]" role="alert">
            {magicState.message}
          </p>
        )}
      </form>

      <p className="text-center text-sm text-[#7A6380]">
        No account yet?{' '}
        <Link href={routes.signup()} className="text-[#FF5B35] hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
