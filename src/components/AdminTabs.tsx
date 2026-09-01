'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

// Dropdown section switcher for the admin panel. Each section is passed as
// pre-rendered content; all mount once (so table sort/filter state survives a
// switch) and only the active one is shown.
export type AdminTab = { id: string; label: string; count?: number; content: ReactNode };

export default function AdminTabs({ tabs }: { tabs: AdminTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div>
      <div className="relative inline-block mb-8" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-3 rounded-[2px] border border-rule/30 bg-paper px-4 py-2.5 text-sm font-semibold text-ink hover:border-ink/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          <span className="text-ink/45 text-xs font-medium uppercase tracking-wider">Section</span>
          <span>{current?.label}</span>
          {typeof current?.count === 'number' && (
            <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-xs font-medium text-ink/60">
              {current.count}
            </span>
          )}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className={`text-ink/50 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div
            role="menu"
            className="absolute left-0 z-20 mt-1 w-72 overflow-hidden rounded-[2px] border border-rule/25 bg-paper shadow-lg"
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  setActive(t.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-ink/[0.04] ${
                  t.id === active ? 'font-semibold text-ink bg-ink/[0.03]' : 'text-ink/70'
                }`}
              >
                <span>{t.label}</span>
                {typeof t.count === 'number' && (
                  <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-xs font-medium text-ink/55">
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {tabs.map((t) => (
        <div key={t.id} className={t.id === active ? '' : 'hidden'}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
