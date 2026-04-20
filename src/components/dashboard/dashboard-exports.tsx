"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, Printer, CheckCircle2 } from "lucide-react";
import type { DashboardPropertyRow } from "@/lib/dashboard/types";

function toNum(v: number | string | null | undefined) {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function escapeCsv(value: string) {
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function buildCsv(rows: DashboardPropertyRow[]) {
  const header = [
    "id",
    "name",
    "city",
    "purchase_price",
    "renovation_cost",
    "monthly_rent",
    "tax_monthly",
    "charges_monthly",
    "monthly_cashflow",
    "net_yield_pct",
    "credit_type",
  ];
  const lines = [header.join(",")];

  for (const r of rows) {
    lines.push(
      [
        String(r.id),
        escapeCsv((r.name ?? "").trim()),
        escapeCsv((r.city ?? "").trim()),
        String(toNum(r.purchase_price)),
        String(toNum(r.renovation_cost)),
        String(toNum(r.monthly_rent)),
        String(toNum(r.tax_monthly)),
        String(toNum(r.charges_monthly)),
        String(toNum(r.monthly_cashflow)),
        String(toNum(r.net_yield)),
        escapeCsv(String(r.credit_type ?? "")),
      ].join(",")
    );
  }

  return lines.join("\n");
}

function downloadText(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function DashboardExports({ rows }: { rows: DashboardPropertyRow[] }) {
  const [checked, setChecked] = useState({
    compromis: false,
    diagnostics: false,
    offre: false,
  });

  const checklistDone = useMemo(() => {
    return checked.compromis && checked.diagnostics && checked.offre;
  }, [checked]);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            const csv = buildCsv(rows);
            const stamp = new Date().toISOString().slice(0, 10);
            downloadText(
              `investflow-portfolio-${stamp}.csv`,
              csv,
              "text/csv;charset=utf-8"
            );
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/15"
        >
          <FileSpreadsheet className="size-4" aria-hidden />
          Exporter CSV
          <Download className="size-4 opacity-90" aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/25 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/15"
        >
          <Printer className="size-4" aria-hidden />
          Exporter PDF
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/85">
              Checklist dossier bancaire
            </p>
            <p className="mt-1 text-xs text-white/55">
              Cochez au fur et à mesure. Rien ne part sans un dossier clean.
            </p>
          </div>
          <span
            className={cx(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
              checklistDone
                ? "bg-emerald-500/10 text-emerald-200 ring-emerald-400/20"
                : "bg-sky-500/10 text-sky-200 ring-sky-400/20"
            )}
          >
            <CheckCircle2 className="size-4" aria-hidden />
            {checklistDone ? "Complet" : "En cours"}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/80 transition hover:bg-white/[0.04]">
            <span>Compromis</span>
            <input
              type="checkbox"
              checked={checked.compromis}
              onChange={(e) =>
                setChecked((s) => ({ ...s, compromis: e.target.checked }))
              }
              className="size-4 accent-sky-400"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/80 transition hover:bg-white/[0.04]">
            <span>Diagnostics</span>
            <input
              type="checkbox"
              checked={checked.diagnostics}
              onChange={(e) =>
                setChecked((s) => ({ ...s, diagnostics: e.target.checked }))
              }
              className="size-4 accent-sky-400"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/80 transition hover:bg-white/[0.04]">
            <span>Offre de prêt</span>
            <input
              type="checkbox"
              checked={checked.offre}
              onChange={(e) =>
                setChecked((s) => ({ ...s, offre: e.target.checked }))
              }
              className="size-4 accent-sky-400"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

