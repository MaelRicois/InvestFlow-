import {
  Building2,
  Percent,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { cx, formatEUR, formatPct } from "@/lib/dashboard/format";

type Props = {
  totalCashflowMensuel: number;
  valeurPatrimoine: number;
  rendementMoyenPct: number;
  tauxOccupation: number;
  hasProperties: boolean;
};

const accent = {
  emerald:
    "from-emerald-400/25 via-emerald-400/0 to-transparent ring-emerald-400/15",
  sky: "from-sky-400/25 via-sky-400/0 to-transparent ring-sky-400/15",
  violet:
    "from-violet-400/25 via-violet-400/0 to-transparent ring-violet-400/15",
  amber:
    "from-amber-400/25 via-amber-400/0 to-transparent ring-amber-400/15",
} as const;

export function DashboardStats({
  totalCashflowMensuel,
  valeurPatrimoine,
  rendementMoyenPct,
  tauxOccupation,
  hasProperties,
}: Props) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <article
        className={cx(
          "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.05),inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur",
          "transition hover:border-emerald-400/20 hover:bg-white/[0.045]"
        )}
      >
        <div
          className={cx(
            "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r",
            accent.emerald
          )}
          aria-hidden
        />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Cash-Flow Total
            </p>
            <p
              className={cx(
                "mt-3 font-display text-2xl font-semibold tabular-nums tracking-tight sm:text-[1.75rem]",
                totalCashflowMensuel > 0
                  ? "text-emerald-300"
                  : totalCashflowMensuel < 0
                    ? "text-rose-300"
                    : "text-white"
              )}
            >
              {totalCashflowMensuel > 0 ? "+" : ""}
              {formatEUR(totalCashflowMensuel)}
              <span className="ml-1.5 text-sm font-medium text-white/50">
                /mois
              </span>
            </p>
            <p className="mt-3 text-xs leading-relaxed text-white/45">
              Synthèse après charges (selon vos paramètres).
            </p>
          </div>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/25 transition group-hover:ring-emerald-400/40">
            <Wallet className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
        </div>
      </article>

      <article
        className={cx(
          "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.05),inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur",
          "transition hover:border-sky-400/20 hover:bg-white/[0.045]"
        )}
      >
        <div
          className={cx(
            "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r",
            accent.sky
          )}
          aria-hidden
        />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Valeur Patrimoine
            </p>
            <p className="mt-3 font-display text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-[1.75rem]">
              {formatEUR(valeurPatrimoine)}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-white/45">
              Achat + travaux (valeur de dossier).
            </p>
          </div>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/25 transition group-hover:ring-sky-400/40">
            <Building2 className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
        </div>
      </article>

      <article
        className={cx(
          "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.05),inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur",
          "transition hover:border-violet-400/20 hover:bg-white/[0.045]"
        )}
      >
        <div
          className={cx(
            "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r",
            accent.violet
          )}
          aria-hidden
        />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Rendement Moyen
            </p>
            <p className="mt-3 font-display text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-[1.75rem]">
              {!hasProperties ? "7,2 %" : formatPct(rendementMoyenPct / 100)}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-white/45">
              Moyenne des rendements nets renseignés.
            </p>
          </div>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-400/25 transition group-hover:ring-violet-400/40">
            <TrendingUp className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
        </div>
      </article>

      <article
        className={cx(
          "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.05),inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur",
          "transition hover:border-amber-400/20 hover:bg-white/[0.045]"
        )}
      >
        <div
          className={cx(
            "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r",
            accent.amber
          )}
          aria-hidden
        />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Taux d&apos;occupation
            </p>
            <p className="mt-3 font-display text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-[1.75rem]">
              {!hasProperties ? "95 %" : formatPct(tauxOccupation, 0)}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-white/45">
              Déduit des loyers mensuels renseignés.
            </p>
          </div>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/25 transition group-hover:ring-amber-400/40">
            <Percent className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
        </div>
      </article>
    </section>
  );
}
