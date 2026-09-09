'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { routes } from '@/lib/routes';

type State = 'loading' | 'signed-out' | 'todo' | 'done';

export default function MarkCompleteButton({
  articleSlug,
  bootcampSlug,
  articleTitle,
  episodeLabel,
}: {
  articleSlug: string;
  bootcampSlug: string;
  articleTitle: string;
  episodeLabel: string;
}) {
  const [state, setState] = useState<State>('loading');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/bootcamp/progress')
      .then((res) => res.json())
      .then((data: { signedIn: boolean; completed: string[] }) => {
        if (cancelled) return;
        if (!data.signedIn) return setState('signed-out');
        setState(data.completed.includes(articleSlug) ? 'done' : 'todo');
      })
      .catch(() => {
        if (!cancelled) setState('signed-out');
      });
    return () => {
      cancelled = true;
    };
  }, [articleSlug]);

  async function toggle() {
    const next = state !== 'done';
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/bootcamp/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleSlug,
          bootcampSlug,
          articleTitle,
          episodeLabel,
          completed: next,
        }),
      });
      if (res.ok) {
        setState(next ? 'done' : 'todo');
        return;
      }
      // A click that saves nothing must say so rather than looking like it worked.
      if (res.status === 401) {
        setState('signed-out');
        return;
      }
      const detail = (await res.json().catch(() => null)) as { message?: string } | null;
      setError(detail?.message ?? 'Could not save that. Please try again.');
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (state === 'loading') {
    return <div className="my-8 h-[86px] rounded-[2px] bg-ink/[0.04] animate-pulse" aria-hidden="true" />;
  }

  return (
    <div className="my-8 rounded-[2px] border border-rule/20 bg-[#F7F4EE] px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-ink">
          {state === 'done' ? `${episodeLabel} complete` : `Finished ${episodeLabel}?`}
        </p>
        <p className="text-sm text-ink/60">
          {state === 'signed-out'
            ? 'Sign in to track your progress through the bootcamp.'
            : state === 'done'
              ? 'This one is ticked off in your account.'
              : 'Mark it off and pick up where you left off next time.'}
        </p>
      </div>

      {state === 'signed-out' ? (
        <Link
          href={`${routes.login()}?redirectTo=${encodeURIComponent(routes.article(articleSlug))}`}
          className="flex-shrink-0 rounded-[2px] bg-navy px-4 py-2.5 text-sm font-semibold text-[#EDE7DA] hover:bg-[#0A1D2B]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
        >
          Sign in to track progress
        </Link>
      ) : (
        <button
          type="button"
          onClick={toggle}
          disabled={saving}
          aria-pressed={state === 'done'}
          className={`flex flex-shrink-0 items-center gap-2 rounded-[2px] px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
            state === 'done'
              ? 'border border-navy/30 text-navy hover:bg-navy/5'
              : 'bg-[#dd3c13] text-[#EDE7DA] hover:bg-[#dd3c13]/90'
          }`}
        >
          {state === 'done' && (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {saving ? 'Saving…' : state === 'done' ? 'Completed' : 'Mark as completed'}
        </button>
      )}
      </div>

      {error && (
        <p className="mt-3 border-t border-rule/15 pt-3 text-sm text-series-02-narrative" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
