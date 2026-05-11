/**
 * Solde restant dû (crédit amortissable), après k mensualités.
 * Formule standard : B_k = P · ((1+r)^n − (1+r)^k) / ((1+r)^n − 1)
 */
export function amortizingRemainingBalance(
  initialPrincipal: number,
  annualRatePercent: number,
  termYears: number,
  paymentsMade: number
): number {
  const P = Math.max(0, initialPrincipal);
  const n = Math.round(Math.max(0, termYears) * 12);
  const k = Math.min(Math.max(0, Math.floor(paymentsMade)), n);
  if (P === 0 || n === 0) return 0;

  const r = (annualRatePercent / 100) / 12;
  if (!Number.isFinite(r) || r < 0) return P;

  if (r === 0) {
    return Math.max(0, P - (P / n) * k);
  }

  const powN = Math.pow(1 + r, n);
  const powK = Math.pow(1 + r, k);
  const denom = powN - 1;
  if (denom === 0) return 0;
  const balance = (P * (powN - powK)) / denom;
  return Math.max(0, balance);
}

/** Hypothèses alignées calculateur / quick-add : apport 20 %, taux 3,8 %, 20 ans. */
export function defaultLoanPrincipal(totalProjectCost: number): number {
  const c = Math.max(0, totalProjectCost);
  return Math.max(0, c - c * 0.2);
}
