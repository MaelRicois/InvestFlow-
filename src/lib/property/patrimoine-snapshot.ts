import { toNum } from "@/lib/dashboard/format";
import {
  amortizingRemainingBalance,
  defaultLoanPrincipal,
} from "@/lib/property/loan-balance";

export type PatrimoineSnapshot = {
  /** Estimation indicative (+3 % sur le coût total projet). */
  valeurEstimee: number;
  capitalRestantDu: number;
  capitalRembourse: number;
  /** Encours / valeur estimée (LTV dette / valeur). */
  ltvEncoursPct: number;
  principalInitial: number;
  moisEcoules: number;
};

export function computePatrimoineSnapshot(property: {
  total_project_cost?: number | string | null;
  created_at?: string | null;
}): PatrimoineSnapshot {
  const cout = toNum(property.total_project_cost);
  const principal0 = defaultLoanPrincipal(cout);
  const created = property.created_at
    ? new Date(property.created_at)
    : new Date();
  const ms = Date.now() - created.getTime();
  const moisEcoules = Math.max(
    0,
    Math.min(240, Math.floor(ms / (1000 * 60 * 60 * 24 * 30.4375)))
  );
  const capitalRestantDu = amortizingRemainingBalance(
    principal0,
    3.8,
    20,
    moisEcoules
  );
  const capitalRembourse = Math.max(0, principal0 - capitalRestantDu);
  const valeurEstimee = cout * 1.03;
  const ltvEncoursPct =
    valeurEstimee > 0 ? (capitalRestantDu / valeurEstimee) * 100 : 0;

  return {
    valeurEstimee,
    capitalRestantDu,
    capitalRembourse,
    ltvEncoursPct,
    principalInitial: principal0,
    moisEcoules,
  };
}
