export type CreditType = "amortissable" | "in_fine" | "comptant";

function monthlyPayment({
  principal,
  annualRatePct,
  years,
}: {
  principal: number;
  annualRatePct: number;
  years: number;
}) {
  const n = Math.round(years * 12);
  if (!Number.isFinite(principal) || principal === 0) return 0;
  if (!Number.isFinite(n) || n <= 0) return 0;

  const r = (annualRatePct / 100) / 12;
  if (!Number.isFinite(r) || r < 0) return 0;

  if (r === 0) return principal / n;
  const denom = 1 - Math.pow(1 + r, -n);
  if (denom === 0) return 0;
  return (principal * r) / denom;
}

/** Hypothèses alignées sur le calculateur : frais de notaire 8 %, vacance 5 %, apport 20 %, taux 3,8 %, 20 ans (sauf comptant / in fine). */
export function computePropertyMetrics(input: {
  purchasePrice: number;
  renovationCost?: number;
  monthlyRent: number;
  taxMonthly: number;
  chargesMonthly: number;
  creditType: CreditType;
}) {
  const travaux = input.renovationCost ?? 0;
  const achatPrix = Math.max(0, input.purchasePrice);
  const fraisNotaire = achatPrix * 0.08;
  const coutTotalProjet = achatPrix + travaux + fraisNotaire;

  const apport = coutTotalProjet * 0.2;
  const taux = 3.8;
  const duree = 20;
  const montantAEmprunter = Math.max(0, coutTotalProjet - apport);

  let mensualite = 0;
  if (input.creditType === "comptant") {
    mensualite = 0;
  } else if (input.creditType === "in_fine") {
    const r = (taux / 100) / 12;
    mensualite = montantAEmprunter * r;
  } else {
    mensualite = monthlyPayment({
      principal: montantAEmprunter,
      annualRatePct: taux,
      years: duree,
    });
  }

  const loyer = Math.max(0, input.monthlyRent);
  const vacanceLocative = loyer * 0.05;
  const cashflowMensuel =
    loyer -
    vacanceLocative -
    Math.max(0, input.taxMonthly) -
    Math.max(0, input.chargesMonthly) -
    mensualite;

  const loyerMensuelNetDeCharges =
    loyer - vacanceLocative - Math.max(0, input.taxMonthly) - Math.max(0, input.chargesMonthly);
  const loyerAnnuelNetDeCharges = loyerMensuelNetDeCharges * 12;
  const rendementNet =
    coutTotalProjet === 0 ? 0 : (loyerAnnuelNetDeCharges / coutTotalProjet) * 100;

  return {
    renovation_cost: travaux,
    notary_fees: fraisNotaire,
    total_project_cost: coutTotalProjet,
    vacancy_monthly: vacanceLocative,
    monthly_cashflow: cashflowMensuel,
    net_yield: rendementNet,
  };
}
