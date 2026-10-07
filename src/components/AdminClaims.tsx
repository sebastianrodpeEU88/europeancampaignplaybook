'use client';

import { useState, useTransition } from 'react';
import { answerClaim } from '@/lib/workshops/actions';
import { REJECT_REASONS, type RejectReason } from '@/lib/workshops/recommend';

export type ClaimRow = {
  id: string;
  email: string | null;
  name: string | null;
  company: string | null;
  stage: string | null;
  eventTitle: string | null;
  eventStart: string | null;
  claimedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'lapsed';
  verdict: 'accept' | 'look' | 'reject' | null;
  score: number | null;
  signals: { label: string; weight: number }[];
  blockers: string[];
  rejectReason: string | null;
  decisionNote: string | null;
  note: string | null;
};

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Brussels',
});

const VERDICT_STYLE: Record<string, string> = {
  accept: 'bg-emerald-100 text-emerald-900',
  look: 'bg-amber-100 text-amber-900',
  reject: 'bg-red-100 text-red-900',
};
const VERDICT_LABEL: Record<string, string> = {
  accept: 'Looks fine',
  look: 'Worth a look',
  reject: 'Would refuse',
};

export default function AdminClaims({ rows, tableReady }: { rows: ClaimRow[]; tableReady: boolean }) {
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [reason, setReason] = useState<Record<string, RejectReason>>({});
  const [note, setNote] = useState<Record<string, string>>({});

  const waiting = rows.filter((r) => r.status === 'pending');
  const answered = rows.filter((r) => r.status !== 'pending');

  const decide = (row: ClaimRow, decision: 'approved' | 'rejected') =>
    startTransition(async () => {
      const res = await answerClaim(row.id, decision, reason[row.id] ?? 'not_eligible', note[row.id] || undefined);
      setNotice({ ok: res.ok, text: res.message });
    });

  return (
    <div>
      <p className="text-sm text-ink/55 mb-4 max-w-3xl">
        <strong>Everyone gets one workshop on the house, and this is where it is asked for.</strong> A
        claim books nothing. Approving emails the person a link so they register themselves, which is
        what gets them the calendar invite and the reminder. Refusing emails them a reason. The
        recommendation is a reading of what we already know about them, and it is advice rather than a
        decision.
      </p>

      {!tableReady && (
        <p className="text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded px-3 py-2 mb-4">
          The claims table is not in the database yet. Run
          <code className="mx-1">supabase/pending/2026-10-06-free-workshop-claims.sql</code>
          and this starts working.
        </p>
      )}

      {notice && (
        <p
          className={`text-sm rounded px-3 py-2 mb-4 border ${
            notice.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {notice.text}
        </p>
      )}

      {waiting.length === 0 && (
        <p className="text-sm text-ink/45 border border-dashed border-ink/20 rounded px-3 py-6 text-center mb-6">
          Nothing waiting.
        </p>
      )}

      <ul className="space-y-2 mb-8">
        {waiting.map((row) => {
          const isOpen = open === row.id;
          return (
            <li key={row.id} className="border border-ink/12 rounded">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : row.id)}
                className="w-full flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 text-left hover:bg-ink/[0.02]"
              >
                {row.verdict && (
                  <span className={`text-xs px-2 py-0.5 rounded ${VERDICT_STYLE[row.verdict]}`}>
                    {VERDICT_LABEL[row.verdict]}
                  </span>
                )}
                <span className="font-medium text-sm">{row.name || row.email}</span>
                {row.company && <span className="text-sm text-ink/45">{row.company}</span>}
                <span className="text-sm text-ink/55">{row.eventTitle}</span>
                <span className="ml-auto text-xs text-ink/40">{dateFmt.format(new Date(row.claimedAt))}</span>
              </button>

              {isOpen && (
                <div className="border-t border-ink/10 p-3 space-y-4">
                  <div className="text-sm text-ink/70 space-y-1">
                    <p>
                      <span className="text-ink/45">Email</span> {row.email}
                      {row.stage && <span className="ml-3 text-ink/45">stage</span>} {row.stage}
                    </p>
                    {row.eventStart && (
                      <p>
                        <span className="text-ink/45">Workshop</span> {row.eventTitle},{' '}
                        {dateFmt.format(new Date(row.eventStart))}
                      </p>
                    )}
                  </div>

                  {row.blockers.length > 0 && (
                    <div>
                      <span className="block text-xs uppercase tracking-wide text-ink/45 mb-1">Reasons to refuse</span>
                      <ul className="text-sm text-red-900 list-disc pl-5 space-y-0.5">
                        {row.blockers.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {row.signals.length > 0 && (
                    <div>
                      <span className="block text-xs uppercase tracking-wide text-ink/45 mb-1">
                        What we know {row.score !== null && `· score ${row.score}`}
                      </span>
                      <ul className="text-sm text-ink/70 list-disc pl-5 space-y-0.5">
                        {row.signals.map((s, i) => (
                          <li key={i}>
                            {s.label} <span className="text-ink/40">({s.weight > 0 ? '+' : ''}{s.weight})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap items-end gap-2">
                    <label className="block">
                      <span className="block text-xs uppercase tracking-wide text-ink/45 mb-1">If refusing, why</span>
                      <select
                        value={reason[row.id] ?? 'not_eligible'}
                        onChange={(e) => setReason((r) => ({ ...r, [row.id]: e.target.value as RejectReason }))}
                        className="border border-ink/20 rounded px-2 py-1.5 text-sm"
                      >
                        {Object.entries(REJECT_REASONS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block flex-1 min-w-[16rem]">
                      <span className="block text-xs uppercase tracking-wide text-ink/45 mb-1">
                        Anything to add, in your words
                      </span>
                      <input
                        value={note[row.id] ?? ''}
                        onChange={(e) => setNote((n) => ({ ...n, [row.id]: e.target.value }))}
                        className="w-full border border-ink/20 rounded px-2 py-1.5 text-sm"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => decide(row, 'approved')}
                      className="text-sm px-3 py-1.5 rounded bg-emerald-700 text-white disabled:opacity-30"
                    >
                      Approve and email them
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => decide(row, 'rejected')}
                      className="text-sm px-3 py-1.5 rounded border border-ink/20 hover:border-ink/50 disabled:opacity-30"
                    >
                      Refuse and email them
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {answered.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-ink/60 mb-2">Already answered</h3>
          <ul className="space-y-1">
            {answered.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center gap-x-3 text-sm px-3 py-1.5 border border-ink/10 rounded">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    row.status === 'approved' ? 'bg-emerald-100 text-emerald-900' : 'bg-ink/10 text-ink/60'
                  }`}
                >
                  {row.status}
                </span>
                <span>{row.name || row.email}</span>
                <span className="text-ink/45">{row.eventTitle}</span>
                {row.rejectReason && <span className="text-ink/40 text-xs">{row.rejectReason}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
