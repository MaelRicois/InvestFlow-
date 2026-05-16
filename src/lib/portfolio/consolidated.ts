import { toNum } from "@/lib/dashboard/format";
import type { DashboardPropertyRow } from "@/lib/dashboard/types";
import { computePatrimoineSnapshot } from "@/lib/property/patrimoine-snapshot";

export type PortfolioConsolidated = {
  propertyCount: number;
  valeurTotale: number;
  detteTotale: number;
  cashflowMensuelTotal: number;
  cashflowAnnuelTotal: number;
  patrimoineNet: number;
  mensualitesCreditTotal: number;
  chargesCreditAnnuelles: number;
};

export function consolidatePortfolio(
  rows: DashboardPropertyRow[]
): PortfolioConsolidated {
  let valeurTotale = 0;
  let detteTotale = 0;
  let cashflowMensuelTotal = 0;
  let mensualitesCreditTotal = 0;

  for (const row of rows) {
    const cout =
      toNum(row.total_project_cost) > 0
        ? toNum(row.total_project_cost)
        : (toNum(row.purchase_price) + toNum(row.renovation_cost)) * 1.08;

    const snap = computePatrimoineSnapshot({
      total_project_cost: cout,
      created_at: row.created_at ?? null,
    });
    valeurTotale += snap.valeurEstimee;
    detteTotale += snap.capitalRestantDu;

    cashflowMensuelTotal += toNum(row.monthly_cashflow);
    mensualitesCreditTotal += estimateMensualiteFromRow(row);
  }

  const cashflowAnnuelTotal = cashflowMensuelTotal * 12;
  const patrimoineNet = valeurTotale - detteTotale;
  const chargesCreditAnnuelles = mensualitesCreditTotal * 12;

  return {
    propertyCount: rows.length,
    valeurTotale,
    detteTotale,
    cashflowMensuelTotal,
    cashflowAnnuelTotal,
    patrimoineNet,
    mensualitesCreditTotal,
    chargesCreditAnnuelles,
  };
}

/** Déduit la mensualité crédit à partir du cash-flow enregistré (cohérent calculateur). */
function estimateMensualiteFromRow(row: DashboardPropertyRow): number {
  const loyer = toNum(row.monthly_rent);
  const vacance = loyer * 0.05;
  const charges =
    toNum(row.tax_monthly) + toNum(row.charges_monthly) + vacance;
  const cf = toNum(row.monthly_cashflow);
  return Math.max(0, loyer - charges - cf);
}

export function computeDebtToIncomeRatio(
  annualSalary: number,
  annualCreditCharges: number
): number | null {
  if (!Number.isFinite(annualSalary) || annualSalary <= 0) return null;
  return (annualCreditCharges / annualSalary) * 100;
}
