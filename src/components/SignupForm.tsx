'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signUp } from '@/lib/auth-actions';
import { idleAuthState } from '@/lib/auth-state';
import { routes } from '@/lib/routes';

const inputClasses =
  'w-full rounded-lg border border-[rgba(43,10,46,0.15)] bg-white px-3 py-2 text-sm text-[#2B0A2E] placeholder:text-[#A896AC] focus:outline-none focus:ring-2 focus:ring-[#FF5B35]';

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, idleAuthState);

  if (state.status === 'check-email') {
    return (
      <div className="rounded-2xl border border-[rgba(43,10,46,0.1)] bg-white p-6">
        <p className="font-semibold text-[#2B0A2E] mb-1">Check your email</p>
        <p className="text-sm text-[#7A6380]">
          Confirm your address to finish creating your account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form action={formAction} className="rounded-2xl border border-[rgba(43,10,46,0.1)] bg-white p-6 space-y-4">
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
            minLength={8}
            autoComplete="new-password"
            className={inputClasses}
          />
          <p className="mt-1 text-xs text-[#A896AC]">At least 8 characters.</p>
        </div>
        {state.status === 'error' && (
          <p className="text-sm text-[#B23A2E]" role="alert">
            {state.message}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-[#2B0A2E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4A1F4D] transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] focus-visible:ring-offset-2"
        >
          {pending ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <p className="text-center text-sm text-[#7A6380]">
        Already have an account?{' '}
        <Link href={routes.login()} className="text-[#FF5B35] hover:underline font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
