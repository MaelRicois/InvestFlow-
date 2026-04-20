import type { Metadata } from "next";
import { Activity, FileText } from "lucide-react";
import { DashboardAddProperty } from "@/components/dashboard/dashboard-add-property";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { DashboardExports } from "@/components/dashboard/dashboard-exports";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardPropertiesSection } from "@/components/dashboard/dashboard-properties-section";
import { CashflowYearChart } from "@/components/dashboard/cashflow-year-chart";
import type { DashboardPropertyRow } from "@/lib/dashboard/types";
import { toNum } from "@/lib/dashboard/format";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Vue d’ensemble de vos biens et indicateurs clés.",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("user_id", userId ?? "");

  const rows = (data ?? []) as DashboardPropertyRow[];

  const totalCashflowMensuel = rows.reduce(
    (s, r) => s + toNum(r.monthly_cashflow),
    0
  );

  const valeurPatrimoine = rows.reduce((s, r) => {
    return s + toNum(r.purchase_price) + toNum(r.renovation_cost);
  }, 0);

  const rendementMoyenPct = rows.length
    ? rows.reduce((s, r) => s + toNum(r.net_yield), 0) / rows.length
    : 0;

  const occupiedCount = rows.filter((r) => toNum(r.monthly_rent) > 0).length;
  const tauxOccupation = rows.length ? occupiedCount / rows.length : 0;

  const cashflowSeries =
    rows.length === 0
      ? [720, 760, 810, 840, 910, 980, 1030, 1080, 1120, 1160, 1200, 1240]
      : [
          Math.max(0, totalCashflowMensuel * 0.62),
          Math.max(0, totalCashflowMensuel * 0.68),
          Math.max(0, totalCashflowMensuel * 0.72),
          Math.max(0, totalCashflowMensuel * 0.75),
          Math.max(0, totalCashflowMensuel * 0.78),
          Math.max(0, totalCashflowMensuel * 0.82),
          Math.max(0, totalCashflowMensuel * 0.86),
          Math.max(0, totalCashflowMensuel * 0.9),
          Math.max(0, totalCashflowMensuel * 0.93),
          Math.max(0, totalCashflowMensuel * 0.96),
          Math.max(0, totalCashflowMensuel * 0.98),
          Math.max(0, totalCashflowMensuel),
        ];

  return (
    <main className="flex-1 bg-stone-950">
      <div className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(56, 189, 248, 0.12), transparent 45%), radial-gradient(circle at 80% 10%, rgba(168, 85, 247, 0.10), transparent 40%), radial-gradient(circle at 50% 85%, rgba(34, 197, 94, 0.09), transparent 45%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
                Gestion de patrimoine
              </p>
              <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Dashboard
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
                Vue institutionnelle de votre portefeuille : liquidités,
                valorisation, performance et conformité documentaire.
              </p>
            </div>
            <DashboardAddProperty />
          </div>

          {error ? (
            <div
              className="mt-8 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
              role="alert"
            >
              Impossible de charger les propriétés : {error.message}
            </div>
          ) : null}

          <div className="mt-10">
            <DashboardStats
              totalCashflowMensuel={totalCashflowMensuel}
              valeurPatrimoine={valeurPatrimoine}
              rendementMoyenPct={rendementMoyenPct}
              tauxOccupation={tauxOccupation}
              hasProperties={rows.length > 0}
            />
          </div>

          <section className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-10">
            <div className="lg:col-span-2">
              <DashboardPropertiesSection rows={rows} />
            </div>

            <aside className="flex flex-col gap-6 lg:col-span-1">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-lg font-semibold tracking-tight text-white">
                      Documents &amp; Rapports
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-white/55">
                      Exports comptables et suivi du dossier bancaire — tout
                      centralisé.
                    </p>
                  </div>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/25">
                    <FileText className="size-5" strokeWidth={1.75} aria-hidden />
                  </span>
                </div>

                <div className="mt-6">
                  <DashboardExports rows={rows} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold tracking-tight text-white">
                      Cash-flow sur l&apos;année
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/55">
                      Tendance consolidée (projection à partir de vos données).
                    </p>
                  </div>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/25">
                    <Activity className="size-5" strokeWidth={1.75} aria-hidden />
                  </span>
                </div>

                <div className="mt-6">
                  <CashflowYearChart series={cashflowSeries} />
                </div>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}
