'use client';

import { useMemo, useState } from 'react';

export type AdminColumn = { key: string; label: string; type?: 'text' | 'date'; minWidth?: string };
type Row = Record<string, string | null>;

function fmt(value: string | null | undefined, type?: 'text' | 'date'): string {
  if (value == null || value === '') return '—';
  if (type === 'date') {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return value;
}

export default function AdminTable({
  title,
  columns,
  rows,
  defaultSortKey,
  defaultSortDir = 'asc',
}: {
  title: string;
  columns: AdminColumn[];
  rows: Row[];
  defaultSortKey?: string;
  defaultSortDir?: 'asc' | 'desc';
}) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState(defaultSortKey ?? columns[0]?.key ?? '');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSortDir);
  const [copied, setCopied] = useState(false);

  const view = useMemo(() => {
    const q = query.trim().toLowerCase();
    const col = columns.find((c) => c.key === sortKey);
    let out = rows;
    if (q) {
      out = out.filter((r) => columns.some((c) => fmt(r[c.key], c.type).toLowerCase().includes(q)));
    }
    out = [...out].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      let cmp: number;
      if (col?.type === 'date') {
        cmp = (new Date(av || 0).getTime() || 0) - (new Date(bv || 0).getTime() || 0);
      } else {
        cmp = fmt(av, col?.type).localeCompare(fmt(bv, col?.type));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return out;
  }, [rows, columns, query, sortKey, sortDir]);

  function toggleSort(key: string) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  async function copy() {
    const header = columns.map((c) => c.label).join('\t');
    const body = view.map((r) => columns.map((c) => fmt(r[c.key], c.type)).join('\t')).join('\n');
    try {
      await navigator.clipboard.writeText(`${header}\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  const btn =
    'rounded-[2px] border border-rule/30 bg-paper px-3 py-1.5 text-sm text-ink/80 hover:bg-ink/[0.03] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink';

  return (
    <section className="mb-14">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <h2 className="display text-xl text-ink">
          {title} <span className="text-ink/40">({view.length}{query ? ` of ${rows.length}` : ''})</span>
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter…"
            className="rounded-[2px] border border-rule/30 bg-paper px-3 py-1.5 text-sm text-ink placeholder:text-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          />
          <button type="button" onClick={copy} className={btn}>
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-[2px] border border-rule/20">
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.04]">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  className="px-3 py-2 text-left font-semibold text-ink whitespace-nowrap cursor-pointer select-none hover:text-ink/60"
                  title="Click to sort"
                >
                  {c.label}
                  {sortKey === c.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-ink/60" colSpan={columns.length}>
                  No matching rows.
                </td>
              </tr>
            ) : (
              view.map((r, i) => (
                <tr key={i} className="border-t border-rule/10">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className="px-3 py-2 align-top text-ink/80"
                      style={c.minWidth ? { minWidth: c.minWidth } : undefined}
                    >
                      {fmt(r[c.key], c.type)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
