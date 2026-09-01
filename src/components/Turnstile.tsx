'use client';

import { useEffect, useRef } from 'react';

// Cloudflare Turnstile CAPTCHA widget. Renders a challenge and writes the
// resulting token into a hidden `captchaToken` input so the surrounding form's
// server action can forward it to Supabase Auth (which verifies it).
//
// If NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset, this renders nothing — so the
// auth forms keep working normally until CAPTCHA is configured on both sides
// (this key here + the secret in the Supabase dashboard). Turn both on together.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      if (window.turnstile) resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.addEventListener('load', () => resolve());
    document.head.appendChild(s);
  });
}

// `resetSignal` should change once per submit attempt (pass the action state):
// Turnstile tokens are single-use, so we reset the widget to mint a fresh one.
export default function Turnstile({ resetSignal }: { resetSignal?: unknown }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetId = useRef<string | null>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;
    loadScript().then(() => {
      if (cancelled || !boxRef.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(boxRef.current, {
        sitekey: SITE_KEY,
        theme: 'light',
        'refresh-expired': 'auto',
        callback: (token: string) => {
          if (inputRef.current) inputRef.current.value = token;
        },
        'expired-callback': () => {
          if (inputRef.current) inputRef.current.value = '';
        },
        'error-callback': () => {
          if (inputRef.current) inputRef.current.value = '';
        },
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (window.turnstile && widgetId.current) {
      window.turnstile.reset(widgetId.current);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [resetSignal]);

  if (!SITE_KEY) return null;
  return (
    <div>
      <div ref={boxRef} />
      <input ref={inputRef} type="hidden" name="captchaToken" defaultValue="" />
    </div>
  );
}
