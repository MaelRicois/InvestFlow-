"use client";

import { useMemo, useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import type { DashboardPropertyRow } from "@/lib/dashboard/types";
import { formatEUR, cx } from "@/lib/dashboard/format";
import {
  consolidatePortfolio,
  computeDebtToIncomeRatio,
  type PortfolioConsolidated,
} from "@/lib/portfolio/consolidated";
import {
  buildAccountingByYear,
  type AccountingTransaction,
} from "@/lib/portfolio/accounting";
import { generateAnnualPatrimonyReportPdfBlob } from "@/components/pdf/AnnualPatrimonyReport";

type Props = {
  rows: DashboardPropertyRow[];
  transactions: AccountingTransaction[];
  initialAnnualSalary: number | null;
};

export function BilanPatrimonialTab({
  rows,
  transactions,
  initialAnnualSalary,
}: Props) {
  const consolidated = useMemo(() => consolidatePortfolio(rows), [rows]);

  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  const { years, summary } = useMemo(
    () => buildAccountingByYear(transactions, selectedYear),
    [transactions, selectedYear]
  );

  const [annualSalary, setAnnualSalary] = useState(
    initialAnnualSalary != null ? String(Math.round(initialAnnualSalary)) : ""
  );
  const [salarySaving, setSalarySaving] = useState(false);
  const [salaryError, setSalaryError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const salaryNum = useMemo(() => {
    const n = Number(annualSalary.replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [annualSalary]);

  const debtToIncomePct = useMemo(
    () =>
      salaryNum != null
        ? computeDebtToIncomeRatio(salaryNum, consolidated.chargesCreditAnnuelles)
        : null,
    [salaryNum, consolidated.chargesCreditAnnuelles]
  );

  async function saveSalary() {
    setSalarySaving(true);
    setSalaryError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          annual_salary: salaryNum,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setSalaryError(data.error ?? `Erreur ${res.status}`);
      }
    } catch (e) {
      setSalaryError(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setSalarySaving(false);
    }
  }

  async function handleGeneratePdf() {
    if (!summary) return;
    setPdfLoading(true);
    try {
      const generatedAtLabel = new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date());

      const blob = await generateAnnualPatrimonyReportPdfBlob({
        year: selectedYear,
        generatedAtLabel,
        consolidated,
        accounting: summary,
        annualSalary: salaryNum,
        debtToIncomePct,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `investflow-rapport-annuel-${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <ConsolidatedCards consolidated={consolidated} />

      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur">
        <h2 className="font-display text-lg font-semibold text-white">
          Profil &amp; taux d&apos;endettement estimé
        </h2>
        <p className="mt-1 text-sm text-white/55">
          Indiquez votre salaire annuel brut pour estimer le ratio charges de
          crédit / revenus (référence bancaire souvent &lt; 35&nbsp;%).
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-white/50">
              Salaire annuel (€)
            </label>
            <input
              inputMode="decimal"
              value={annualSalary}
              onChange={(e) => setAnnualSalary(e.target.value)}
              placeholder="ex. 45000"
              className="mt-1.5 h-11 w-full max-w-xs rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
          <button
            type="button"
            onClick={saveSalary}
            disabled={salarySaving}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-stone-950 transition hover:bg-white/90 disabled:opacity-50"
          >
            {salarySaving ? "Enregistrement…" : "Enregistrer le profil"}
          </button>
        </div>
        {salaryError ? (
          <p className="mt-2 text-sm text-rose-300" role="alert">
            {salaryError}
          </p>
        ) : null}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <MetricBox
            label="Charges crédit / an (estim.)"
            value={formatEUR(consolidated.chargesCreditAnnuelles)}
          />
          <MetricBox
            label="Taux d'endettement estimé"
            value={
              debtToIncomePct != null
                ? `${debtToIncomePct.toFixed(1)} %`
                : "—"
            }
            highlight={debtToIncomePct != null && debtToIncomePct > 35}
          />
          <MetricBox label="Repère" value="Souvent < 35 % visé" muted />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Préparation comptable
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Revenus et dépenses réels (transactions), filtrés par année civile.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-white/70">
            Année
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="h-10 rounded-lg border border-white/10 bg-stone-900 px-3 text-sm text-white outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>

        {summary ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <MetricBox
                label={`Revenus ${selectedYear}`}
                value={formatEUR(summary.revenus)}
                positive
              />
              <MetricBox
                label={`Dépenses ${selectedYear}`}
                value={formatEUR(summary.depenses)}
              />
              <MetricBox
                label="Solde"
                value={formatEUR(summary.solde)}
                positive={summary.solde >= 0}
              />
            </div>

            <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.04]">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-white/50">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Projet</th>
                    <th className="px-4 py-3">Libellé</th>
                    <th className="px-4 py-3">Catégorie</th>
                    <th className="px-4 py-3 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {summary.lines.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-white/50"
                      >
                        Aucune transaction pour {selectedYear}. Ajoutez des
                        mouvements dans le suivi financier de chaque projet.
                      </td>
                    </tr>
                  ) : (
                    summary.lines.map((line) => (
                      <tr key={String(line.id)} className="text-white/85">
                        <td className="whitespace-nowrap px-4 py-3">
                          {line.occurred_on}
                        </td>
                        <td className="px-4 py-3">{line.property_name}</td>
                        <td className="px-4 py-3">{line.label}</td>
                        <td className="px-4 py-3 text-white/55">
                          {line.category ?? "—"}
                        </td>
                        <td
                          className={cx(
                            "px-4 py-3 text-right font-semibold tabular-nums",
                            line.amount >= 0
                              ? "text-emerald-300"
                              : "text-rose-300"
                          )}
                        >
                          {formatEUR(line.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/55">
          Export PDF : synthèse patrimoniale + préparation comptable pour l&apos;année
          sélectionnée.
        </p>
        <button
          type="button"
          onClick={handleGeneratePdf}
          disabled={pdfLoading || rows.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500/90 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-400 disabled:opacity-50"
        >
          {pdfLoading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <FileDown className="size-4" aria-hidden />
          )}
          Générer le rapport annuel PDF
        </button>
      </div>
    </div>
  );
}

function ConsolidatedCards({
  consolidated,
}: {
  consolidated: PortfolioConsolidated;
}) {
  const items = [
    {
      label: "Valeur totale estimée",
      value: formatEUR(consolidated.valeurTotale),
    },
    {
      label: "Dette totale",
      value: formatEUR(consolidated.detteTotale),
    },
    {
      label: "Cash-flow mensuel total",
      value: formatEUR(consolidated.cashflowMensuelTotal),
      accent: consolidated.cashflowMensuelTotal >= 0,
    },
    {
      label: "Patrimoine net estimé",
      value: formatEUR(consolidated.patrimoineNet),
    },
  ];

  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-white">
        Vue consolidée
      </h2>
      <p className="mt-1 text-sm text-white/55">
        Somme de vos {consolidated.propertyCount} bien
        {consolidated.propertyCount > 1 ? "s" : ""}.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
              {item.label}
            </p>
            <p
              className={cx(
                "mt-2 text-2xl font-semibold tabular-nums tracking-tight",
                item.accent === false
                  ? "text-rose-300"
                  : item.accent === true
                    ? "text-emerald-300"
                    : "text-white"
              )}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MetricBox({
  label,
  value,
  positive,
  highlight,
  muted,
}: {
  label: string;
  value: string;
  positive?: boolean;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-xl border border-white/10 bg-white/[0.02] p-4",
        highlight && "border-amber-400/30 bg-amber-500/10"
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
        {label}
      </p>
      <p
        className={cx(
          "mt-2 text-lg font-semibold tabular-nums",
          muted ? "text-sm font-normal text-white/50" : "text-white",
          positive === true && "text-emerald-300",
          positive === false && "text-rose-300"
        )}
      >
        {value}
      </p>
    </div>
  );
}