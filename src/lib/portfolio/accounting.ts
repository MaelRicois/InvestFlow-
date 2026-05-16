export type AccountingTransaction = {
  id: number | string;
  property_id: number;
  property_name: string;
  occurred_on: string;
  label: string;
  amount: number;
  category: string | null;
};

export type AccountingYearSummary = {
  year: number;
  revenus: number;
  depenses: number;
  solde: number;
  lines: AccountingTransaction[];
};

export function getCalendarYear(isoDate: string): number {
  return Number(isoDate.slice(0, 4));
}

export function buildAccountingByYear(
  transactions: AccountingTransaction[],
  selectedYear?: number
): {
  years: number[];
  summary: AccountingYearSummary | null;
  allSummaries: AccountingYearSummary[];
} {
  const yearSet = new Set<number>();
  const nowYear = new Date().getFullYear();
  yearSet.add(nowYear);

  for (const t of transactions) {
    if (t.occurred_on.length >= 4) {
      yearSet.add(getCalendarYear(t.occurred_on));
    }
  }

  const years = [...yearSet].sort((a, b) => b - a);
  const targetYear = selectedYear ?? years[0] ?? nowYear;

  const allSummaries = years.map((year) => summarizeYear(transactions, year));
  const summary =
    allSummaries.find((s) => s.year === targetYear) ??
    summarizeYear(transactions, targetYear);

  return { years, summary, allSummaries };
}

function summarizeYear(
  transactions: AccountingTransaction[],
  year: number
): AccountingYearSummary {
  const lines = transactions.filter(
    (t) => getCalendarYear(t.occurred_on) === year
  );
  let revenus = 0;
  let depenses = 0;
  for (const t of lines) {
    if (t.amount >= 0) revenus += t.amount;
    else depenses += Math.abs(t.amount);
  }
  return {
    year,
    revenus,
    depenses,
    solde: revenus - depenses,
    lines: lines.sort((a, b) => b.occurred_on.localeCompare(a.occurred_on)),
  };
}
