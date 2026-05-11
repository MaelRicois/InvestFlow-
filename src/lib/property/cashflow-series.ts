export type MonthPoint = { key: string; label: string; value: number };

/** Six derniers mois calendaires (du plus ancien au plus récent). */
export function lastSixCalendarMonths(now = new Date()): MonthPoint[] {
  const out: MonthPoint[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("fr-FR", {
      month: "short",
      year: "2-digit",
    }).format(d);
    out.push({ key, label, value: 0 });
  }
  return out;
}

/**
 * Somme des `amount` par mois (clé YYYY-MM). Les points sans transaction restent à 0.
 */
export function fillMonthlyTotalsFromTransactions(
  base: MonthPoint[],
  rows: { occurred_on: string; amount: number }[]
): MonthPoint[] {
  const sums = new Map<string, number>();
  for (const p of base) {
    sums.set(p.key, 0);
  }
  for (const r of rows) {
    const d = r.occurred_on.slice(0, 7);
    if (!sums.has(d)) continue;
    sums.set(d, (sums.get(d) ?? 0) + r.amount);
  }
  return base.map((p) => ({ ...p, value: sums.get(p.key) ?? 0 }));
}
