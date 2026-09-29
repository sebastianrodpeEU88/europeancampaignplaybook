'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  STAGES,
  SOURCES,
  CLIENT_TYPES,
  FUNNEL_ORDER,
  STAGE_LABELS,
  type Stage,
} from '@/lib/crm/funnel';
import { setContactStage, setContactField, addContactNote } from '@/lib/crm/actions';

export type ContactRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  stage: Stage;
  stageChangedAt: string | null;
  source: string | null;
  clientType: string | null;
  membership: string | null;
  events: number;
  bootcampDays: number;
  newsletter: string;
  status: 'active' | 'junk';
  notes: { body: string; author: string | null; createdAt: string }[];
};

const select =
  'rounded-[2px] border border-rule/30 bg-paper px-2 py-1 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20';

function when(value: string | null): string {
  if (!value) return '—';
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminContacts({ rows }: { rows: ContactRow[] }) {
  const [query, setQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [showJunk, setShowJunk] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of rows) {
      if (r.status === 'junk') continue;
      c[r.stage] = (c[r.stage] ?? 0) + 1;
    }
    return c;
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (r.status === 'junk' && !showJunk) return false;
      if (stageFilter !== 'all' && r.stage !== stageFilter) return false;
      if (!q) return true;
      return [r.name, r.email, r.company, r.membership].some((v) => v?.toLowerCase().includes(q));
    });
  }, [rows, query, stageFilter, showJunk]);

  return (
    <section>
      <h2 className="display text-xl text-ink mb-1">contacts</h2>
      <p className="text-sm text-ink/55 mb-4">
        One record per person, one stage each. The stage moves forward on its own when somebody
        books an info session, attends a workshop or starts a membership; conversations, closing,
        lost and dormant are yours to set. Every change syncs to the CRM mirror and the newsletter.
      </p>

      {/* The funnel, as counts you can click */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setStageFilter('all')}
          className={`rounded-[2px] border px-3 py-1.5 text-sm ${
            stageFilter === 'all' ? 'border-ink bg-ink text-paper' : 'border-rule/30 text-ink/70 hover:border-ink/40'
          }`}
        >
          All {rows.filter((r) => r.status === 'active').length}
        </button>
        {FUNNEL_ORDER.map((stage) => (
          <button
            key={stage}
            type="button"
            onClick={() => setStageFilter(stage)}
            className={`rounded-[2px] border px-3 py-1.5 text-sm ${
              stageFilter === stage ? 'border-ink bg-ink text-paper' : 'border-rule/30 text-ink/70 hover:border-ink/40'
            }`}
          >
            {STAGE_LABELS[stage]} {counts[stage] ?? 0}
          </button>
        ))}
        {(['lost', 'dormant'] as const).map((stage) => (
          <button
            key={stage}
            type="button"
            onClick={() => setStageFilter(stage)}
            className={`rounded-[2px] border px-3 py-1.5 text-sm ${
              stageFilter === stage ? 'border-ink bg-ink text-paper' : 'border-rule/30 text-ink/50 hover:border-ink/40'
            }`}
          >
            {STAGE_LABELS[stage]} {counts[stage] ?? 0}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, company…"
          className="w-64 rounded-[2px] border border-rule/30 bg-paper px-3 py-1.5 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink/20"
        />
        <label className="flex items-center gap-2 text-sm text-ink/60">
          <input type="checkbox" checked={showJunk} onChange={(e) => setShowJunk(e.target.checked)} />
          show junk
        </label>
        <span className="text-sm text-ink/45">
          {visible.length} shown{pending ? ' · saving…' : ''}
        </span>
      </div>

      <div className="overflow-x-auto rounded-[2px] border border-rule/20">
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.04] text-left text-xs uppercase tracking-wider text-ink/45">
            <tr>
              <th className="px-3 py-2 font-semibold">Person</th>
              <th className="px-3 py-2 font-semibold">Stage</th>
              <th className="px-3 py-2 font-semibold">Since</th>
              <th className="px-3 py-2 font-semibold">Source</th>
              <th className="px-3 py-2 font-semibold">Client</th>
              <th className="px-3 py-2 font-semibold">Activity</th>
              <th className="px-3 py-2 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule/10">
            {visible.map((r) => (
              <tr key={r.id} className={r.status === 'junk' ? 'opacity-50' : undefined}>
                <td className="px-3 py-2 align-top">
                  <div className="font-medium text-ink">{r.name}</div>
                  <div className="text-ink/55">{r.email}</div>
                  {r.company && <div className="text-ink/45">{r.company}</div>}
                </td>
                <td className="px-3 py-2 align-top">
                  <select
                    className={select}
                    value={r.stage}
                    disabled={pending}
                    onChange={(e) =>
                      startTransition(async () => {
                        await setContactStage(r.id, e.target.value);
                      })
                    }
                  >
                    {STAGES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 align-top text-ink/55">{when(r.stageChangedAt)}</td>
                <td className="px-3 py-2 align-top">
                  <select
                    className={select}
                    value={r.source ?? ''}
                    disabled={pending}
                    onChange={(e) =>
                      startTransition(async () => {
                        await setContactField(r.id, 'acquisition_source', e.target.value || null);
                      })
                    }
                  >
                    <option value="">—</option>
                    {SOURCES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 align-top">
                  <select
                    className={select}
                    value={r.clientType ?? ''}
                    disabled={pending}
                    onChange={(e) =>
                      startTransition(async () => {
                        await setContactField(r.id, 'client_type', e.target.value || null);
                      })
                    }
                  >
                    <option value="">—</option>
                    {CLIENT_TYPES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {r.membership && <div className="mt-1 text-xs text-ink/45">{r.membership}</div>}
                </td>
                <td className="px-3 py-2 align-top text-ink/55">
                  {r.events} event{r.events === 1 ? '' : 's'}
                  {r.bootcampDays > 0 && <> · {r.bootcampDays} bootcamp</>}
                  <div className="text-xs text-ink/45">newsletter: {r.newsletter}</div>
                </td>
                <td className="px-3 py-2 align-top">
                  <button
                    type="button"
                    onClick={() => setOpen(open === r.id ? null : r.id)}
                    className="text-ink underline underline-offset-2 hover:no-underline"
                  >
                    {r.notes.length > 0 ? `${r.notes.length} note${r.notes.length === 1 ? '' : 's'}` : 'add'}
                  </button>
                  {open === r.id && (
                    <div className="mt-2 w-72 space-y-2">
                      {r.notes.map((n, i) => (
                        <div key={i} className="rounded-[2px] bg-ink/[0.04] p-2 text-ink/75">
                          <div className="whitespace-pre-wrap">{n.body}</div>
                          <div className="mt-1 text-xs text-ink/40">
                            {n.author ?? 'unknown'} · {when(n.createdAt)}
                          </div>
                        </div>
                      ))}
                      <form
                        action={async (formData: FormData) => {
                          const body = String(formData.get('body') || '');
                          startTransition(async () => {
                            await addContactNote(r.id, body);
                          });
                        }}
                        className="space-y-2"
                      >
                        <textarea
                          name="body"
                          rows={3}
                          placeholder="What happened, what next…"
                          className="w-full rounded-[2px] border border-rule/30 bg-paper p-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink/20"
                        />
                        <button
                          type="submit"
                          className="rounded-[2px] bg-ink px-3 py-1.5 text-sm text-paper hover:bg-ink/90"
                        >
                          Save note
                        </button>
                      </form>
                      <button
                        type="button"
                        onClick={() =>
                          startTransition(async () => {
                            await setContactField(r.id, 'status', r.status === 'junk' ? 'active' : 'junk');
                          })
                        }
                        className="text-xs text-ink/50 underline underline-offset-2 hover:no-underline"
                      >
                        {r.status === 'junk' ? 'restore from junk' : 'mark as junk'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
