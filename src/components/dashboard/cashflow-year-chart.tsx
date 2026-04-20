function sparklinePath(values: number[], width: number, height: number) {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const dx = width / Math.max(1, values.length - 1);
  const norm = (v: number) => {
    if (max === min) return height / 2;
    return height - ((v - min) / (max - min)) * height;
  };
  return values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${i * dx} ${norm(v)}`)
    .join(" ");
}

type Props = {
  series: number[];
  /** Unique id for SVG defs when multiple charts on page */
  gradientId?: string;
};

export function CashflowYearChart({
  series,
  gradientId = "cfGradient",
}: Props) {
  const pathLine = sparklinePath(series, 260, 70);
  const pathArea = `${pathLine} L 260 90 L 0 90 Z`;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <svg
        viewBox="0 0 260 90"
        className="h-28 w-full"
        role="img"
        aria-label="Évolution du cash-flow sur 12 mois"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(52,211,153,0.38)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0)" />
          </linearGradient>
          <linearGradient id={`${gradientId}-line`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(16,185,129,0.85)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0.95)" />
          </linearGradient>
        </defs>
        <path d={pathArea} fill={`url(#${gradientId})`} />
        <path
          d={pathLine}
          fill="none"
          stroke={`url(#${gradientId}-line)`}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="mt-3 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-white/40">
        <span>Jan</span>
        <span>Mar</span>
        <span>Mai</span>
        <span>Juil</span>
        <span>Sep</span>
        <span>Nov</span>
      </div>
      <p className="sr-only">
        Courbe sur douze mois : janvier à décembre.
      </p>
    </div>
  );
}
