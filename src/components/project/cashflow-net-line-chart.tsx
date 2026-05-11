type Props = {
  labels: string[];
  values: number[];
  /** Préfixe unique pour les ids de dégradé SVG si plusieurs graphiques. */
  uid?: string;
};

function linePath(values: number[], width: number, height: number) {
  if (values.length === 0) return "";
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const pad = 8;
  const h = height - pad * 2;
  const w = width - pad * 2;
  const dx = values.length > 1 ? w / (values.length - 1) : 0;
  const span = max - min || 1;
  const norm = (v: number) => pad + h - ((v - min) / span) * h;
  return values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${pad + i * dx} ${norm(v)}`)
    .join(" ");
}

export function CashflowNetLineChart({
  labels,
  values,
  uid = "cf6",
}: Props) {
  const W = 320;
  const H = 120;
  const path = linePath(values, W, H);
  const lastY = (() => {
    if (values.length === 0) return H / 2;
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 0);
    const pad = 8;
    const h = H - pad * 2;
    const span = max - min || 1;
    return pad + h - ((values[values.length - 1]! - min) / span) * h;
  })();
  const area = `${path} L ${W - 8} ${H} L 8 ${H} Z`;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
        Cash-flow net réalisé (6 mois)
      </p>
      <p className="mt-1 text-sm text-stone-600">
        Somme des montants enregistrés par mois (entrées positives, sorties
        négatives).
      </p>
      <svg
        viewBox={`0 0 ${W} ${H + 28}`}
        className="mt-4 h-40 w-full"
        role="img"
        aria-label="Courbe du cash-flow net sur six mois"
      >
        <defs>
          <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </linearGradient>
          <linearGradient id={`${uid}-stroke`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(37, 99, 235)" />
            <stop offset="100%" stopColor="rgb(56, 189, 248)" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${uid}-fill)`} />
        <path
          d={path}
          fill="none"
          stroke={`url(#${uid}-stroke)`}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle
          cx={W - 8}
          cy={lastY}
          r="4"
          className="fill-blue-600 stroke-white"
          strokeWidth="2"
        />
        {labels.map((lab, i) => {
          const x = 8 + (labels.length > 1 ? ((W - 16) / (labels.length - 1)) * i : (W - 16) / 2);
          return (
            <text
              key={lab}
              x={x}
              y={H + 18}
              textAnchor="middle"
              className="fill-stone-500 text-[9px] font-medium uppercase"
            >
              {lab}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
