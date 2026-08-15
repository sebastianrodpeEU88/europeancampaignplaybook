// Single-series magnitude-over-time bar chart (projected monthly income).
// One brand hue (navy) on paper — no legend/CVD concerns for a single series.
// Native <title> gives a per-bar hover tooltip; no client JS needed.
export default function CashflowChart({ data }: { data: { label: string; amount: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-ink/55">No cashflow data yet.</p>;
  }

  const max = Math.max(1, ...data.map((d) => d.amount));
  const total = data.reduce((s, d) => s + d.amount, 0);
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

  return (
    <div>
      <p className="text-sm text-ink/60 mb-3">
        Projected income — total <strong className="text-ink">{money(total)}</strong> across{' '}
        {data.length} month{data.length === 1 ? '' : 's'}.
      </p>
      <div className="overflow-x-auto rounded-[2px] border border-rule/20 bg-paper p-4">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          width={w}
          height={h}
          role="img"
          aria-label="Projected monthly cashflow"
          style={{ maxWidth: '100%', height: 'auto' }}
        >
          <line x1={padL} y1={baseY} x2={w - padR} y2={baseY} stroke="#33312D" strokeOpacity="0.25" strokeWidth="1" />
          {data.map((d, i) => {
            const x = padL + i * (barW + gap);
            const bh = d.amount > 0 ? Math.max(2, (d.amount / max) * plotH) : 0;
            const y = baseY - bh;
            const cx = x + barW / 2;
            return (
              <g key={d.label}>
                {bh > 0 && (
                  <rect x={x} y={y} width={barW} height={bh} rx="3" fill="#0A1D2B">
                    <title>{`${d.label}: €${d.amount.toFixed(2)}`}</title>
                  </rect>
                )}
                {d.amount > 0 && (
                  <text x={cx} y={y - 6} textAnchor="middle" fontSize="10" fill="#111111">
                    {money(d.amount)}
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
