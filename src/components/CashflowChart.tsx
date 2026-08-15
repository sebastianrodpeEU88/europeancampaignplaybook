// Two-series stacked bar chart: projected monthly income split by membership
// source (Legacy vs New). Palette validated (blue/amber, CVD ΔE ~32); identity
// is carried by a legend + a 2px gap between segments, and values wear ink, not
// the series colour. Native <title> gives per-segment hover; no client JS.

const LEGACY = '#154DA5';
const NEW = '#C78819';

type Datum = { label: string; legacy: number; new: number };

export default function CashflowChart({ data }: { data: Datum[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-ink/55">No cashflow data yet.</p>;
  }

  const max = Math.max(1, ...data.map((d) => d.legacy + d.new));
  const legacyTotal = data.reduce((s, d) => s + d.legacy, 0);
  const newTotal = data.reduce((s, d) => s + d.new, 0);
  const money = (n: number) => `€${n.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;

  const barW = 44;
  const gap = 14;
  const padL = 10;
  const padR = 10;
  const padTop = 22;
  const plotH = 220;
  const labelH = 52;
  const w = padL + padR + data.length * barW + (data.length - 1) * gap;
  const h = padTop + plotH + labelH;
  const baseY = padTop + plotH;
  const seg = (v: number) => (v > 0 ? Math.max(2, (v / max) * plotH) : 0);

  return (
    <div>
      {/* Legend (identity is never colour-alone) + totals */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-3 text-sm text-ink/70">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-[1px]" style={{ background: LEGACY }} aria-hidden="true" />
          Legacy <strong className="text-ink">{money(legacyTotal)}</strong>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-[1px]" style={{ background: NEW }} aria-hidden="true" />
          New <strong className="text-ink">{money(newTotal)}</strong>
        </span>
        <span className="text-ink/50">· total <strong className="text-ink">{money(legacyTotal + newTotal)}</strong></span>
      </div>

      <div className="overflow-x-auto rounded-[2px] border border-rule/20 bg-paper p-4">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          width={w}
          height={h}
          role="img"
          aria-label="Projected monthly cashflow, split by Legacy and New memberships"
          style={{ maxWidth: '100%', height: 'auto' }}
        >
          <line x1={padL} y1={baseY} x2={w - padR} y2={baseY} stroke="#33312D" strokeOpacity="0.25" strokeWidth="1" />
          {data.map((d, i) => {
            const x = padL + i * (barW + gap);
            const cx = x + barW / 2;
            const hLegacy = seg(d.legacy);
            const hNew = seg(d.new);
            const segGap = hLegacy > 0 && hNew > 0 ? 2 : 0;
            const legacyY = baseY - hLegacy;
            const newY = baseY - hLegacy - segGap - hNew;
            const topY = Math.min(hLegacy > 0 ? legacyY : baseY, hNew > 0 ? newY : baseY);
            const total = d.legacy + d.new;
            return (
              <g key={d.label}>
                {hLegacy > 0 && (
                  <rect x={x} y={legacyY} width={barW} height={hLegacy} rx="2" fill={LEGACY}>
                    <title>{`Legacy — ${d.label}: €${d.legacy.toFixed(2)}`}</title>
                  </rect>
                )}
                {hNew > 0 && (
                  <rect x={x} y={newY} width={barW} height={hNew} rx="2" fill={NEW}>
                    <title>{`New — ${d.label}: €${d.new.toFixed(2)}`}</title>
                  </rect>
                )}
                {total > 0 && (
                  <text x={cx} y={topY - 6} textAnchor="middle" fontSize="10" fill="#111111">
                    {money(total)}
                  </text>
                )}
                <text
                  x={cx}
                  y={baseY + 16}
                  textAnchor="end"
                  fontSize="10"
                  fill="#111111"
                  fillOpacity="0.6"
                  transform={`rotate(-40 ${cx} ${baseY + 16})`}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
