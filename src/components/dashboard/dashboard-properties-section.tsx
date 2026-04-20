import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  DoorOpen,
  Home,
  TrendingUp,
} from "lucide-react";
import type { DashboardPropertyRow } from "@/lib/dashboard/types";
import {
  cx,
  formatEUR,
  formatPct,
  toNum,
} from "@/lib/dashboard/format";
import { buildCalculateurHrefFromProperty } from "@/lib/dashboard/calculateur-href";

type Props = {
  rows: DashboardPropertyRow[];
};

export function DashboardPropertiesSection({ rows }: Props) {
  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-white">
            Mes Propriétés
          </h2>
          <p className="mt-1 text-sm text-white/55">
            Statut locatif, cash-flow par bien et accès dossier.
          </p>
        </div>
        <p className="text-xs font-medium uppercase tracking-widest text-white/40">
          {rows.length} bien{rows.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Mobile / tablet : cartes horizontales */}
      <div className="mt-6 space-y-3 lg:hidden">
        {rows.length === 0 ? (
          <EmptyState />
        ) : (
          rows.map((p) => <PropertyMobileCard key={p.id} p={p} />)
        )}
      </div>

      {/* Desktop : table */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-white/10 bg-white/[0.04]">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                <th className="px-6 py-4">Bien</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Cash-flow</th>
                <th className="px-6 py-4">Rendement</th>
                <th className="px-6 py-4 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {rows.length === 0 ? (
                <tr>
                  <td className="px-6 py-14 text-center" colSpan={5}>
                    <EmptyState inline />
                  </td>
                </tr>
              ) : (
                rows.map((p) => {
                  const cf = toNum(p.monthly_cashflow);
                  const y = toNum(p.net_yield);
                  const occupied = toNum(p.monthly_rent) > 0;
                  const name = p.name?.trim() || "Sans nom";
                  const city =
                    p.city != null && String(p.city).trim() !== ""
                      ? String(p.city).trim()
                      : null;

                  return (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-white/[0.035]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/70 ring-1 ring-white/10">
                            <Building2 className="size-4" aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-white/45">
                              {city ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill occupied={occupied} />
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cx(
                            "text-sm font-semibold tabular-nums",
                            cf > 0
                              ? "text-emerald-300"
                              : cf < 0
                                ? "text-rose-300"
                                : "text-white/75"
                          )}
                        >
                          {cf > 0 ? "+" : ""}
                          {formatEUR(cf)}
                          <span className="ml-1 text-xs font-medium text-white/45">
                            /mois
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold tabular-nums text-white/85">
                          <TrendingUp
                            className="size-4 text-violet-300/90"
                            aria-hidden
                          />
                          {y > 0 ? formatPct(y / 100, 2) : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={buildCalculateurHrefFromProperty(p)}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white/90 transition hover:border-emerald-400/25 hover:bg-emerald-500/[0.07]"
                        >
                          Détails
                          <ArrowUpRight className="size-4" aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ occupied }: { occupied: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1",
        occupied
          ? "bg-emerald-500/12 text-emerald-200 ring-emerald-400/25"
          : "bg-amber-500/12 text-amber-200 ring-amber-400/25"
      )}
    >
      {occupied ? (
        <DoorOpen className="size-3.5 opacity-90" aria-hidden />
      ) : (
        <Home className="size-3.5 opacity-80" aria-hidden />
      )}
      {occupied ? "Loué" : "Vacant"}
    </span>
  );
}

function PropertyMobileCard({ p }: { p: DashboardPropertyRow }) {
  const cf = toNum(p.monthly_cashflow);
  const occupied = toNum(p.monthly_rent) > 0;
  const name = p.name?.trim() || "Sans nom";
  const city =
    p.city != null && String(p.city).trim() !== ""
      ? String(p.city).trim()
      : null;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-white/70 ring-1 ring-white/10">
          <Building2 className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">{name}</p>
          <p className="mt-0.5 truncate text-xs text-white/45">{city ?? "—"}</p>
          <div className="mt-3 sm:hidden">
            <StatusPill occupied={occupied} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-6">
        <div className="hidden sm:block">
          <StatusPill occupied={occupied} />
        </div>
        <div className="min-w-[8rem]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            Cash-flow
          </p>
          <p
            className={cx(
              "mt-0.5 text-lg font-semibold tabular-nums",
              cf > 0
                ? "text-emerald-300"
                : cf < 0
                  ? "text-rose-300"
                  : "text-white/80"
            )}
          >
            {cf > 0 ? "+" : ""}
            {formatEUR(cf)}
            <span className="ml-1 text-xs font-medium text-white/45">/mois</span>
          </p>
        </div>
        <Link
          href={buildCalculateurHrefFromProperty(p)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white/90 transition hover:border-sky-400/30 hover:bg-sky-500/10 sm:w-auto"
        >
          Détails
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

function EmptyState({ inline }: { inline?: boolean }) {
  const content = (
    <>
      Aucun bien enregistré pour l&apos;instant.{" "}
      <Link
        href="/calculateur"
        className="font-semibold text-sky-300 underline-offset-4 hover:text-sky-200 hover:underline"
      >
        Lancer une simulation
      </Link>
      .
    </>
  );

  if (inline) {
    return <p className="text-sm text-white/60">{content}</p>;
  }

  return (
    <div
      className={cx(
        "rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-12 text-center text-sm text-white/60"
      )}
    >
      {content}
    </div>
  );
}
