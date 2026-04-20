/**
 * Aligné sur la logique du calculateur (notaire 8 %, vacance 5 % du loyer).
 */
export function computeNetYieldPct(input: {
  purchasePriceEur: number;
  worksBudgetEur: number;
  monthlyRentEur: number;
  monthlyPropertyTaxEur: number;
  monthlyChargesInsuranceEur: number;
}): number {
  const achatPrix = input.purchasePriceEur;
  const travaux = input.worksBudgetEur;
  const fraisNotaire = achatPrix * 0.08;
  const coutTotalProjet = achatPrix + travaux + fraisNotaire;

  const loyer = input.monthlyRentEur;
  const taxe = input.monthlyPropertyTaxEur;
  const charges = input.monthlyChargesInsuranceEur;
  const vacanceLocative = loyer * 0.05;
  const loyerMensuelNetDeCharges =
    loyer - vacanceLocative - taxe - charges;
  const loyerAnnuelNetDeCharges = loyerMensuelNetDeCharges * 12;

  if (!Number.isFinite(coutTotalProjet) || coutTotalProjet <= 0) return 0;
  return (loyerAnnuelNetDeCharges / coutTotalProjet) * 100;
}
