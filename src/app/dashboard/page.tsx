import type { Metadata } from "next";
import Link from "next/link";
import { Activity, FileText } from "lucide-react";
import { DashboardAddProperty } from "@/components/dashboard/dashboard-add-property";
import { DashboardSupabaseEnvLog } from "@/components/dashboard/dashboard-supabase-env-log";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { DashboardExports } from "@/components/dashboard/dashboard-exports";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { PropertyCard } from "@/components/dashboard/property-card";
import { CashflowYearChart } from "@/components/dashboard/cashflow-year-chart";
import type { DashboardPropertyRow } from "@/lib/dashboard/types";
import { toNum } from "@/lib/dashboard/format";

const PROPERTIES_COLUMN_HINT =
  "\n\nSchéma InvestFlow : utiliser les colonnes `name`, `city`, `monthly_cashflow`, `net_yield` (et non `cash_flow` / `yield`). Fichier de référence : `supabase/migrations/20260419120000_properties_clerk_rls.sql`.";

const RLS_CLERK_HINT =
  "\n\nSi vous voyez « permission denied » ou aucune ligne alors que des données existent : les policies RLS comparent `user_id` à `auth.jwt()->>'sub'`. Configurez le template JWT **supabase** dans Clerk et l’auth Clerk côté Supabase (voir commentaires dans la migration `20260419120000_properties_clerk_rls.sql`).";

export const metadata: Metadata = {
  title: "Dashboard — Mes projets",
  description:
    "Liste de vos projets immobiliers : ville, rentabilité nette et cash-flow mensuel.",
};

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="flex-1 bg-stone-950">
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
            Mes projets
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/60">
            Connectez-vous pour voir vos projets enregistrés dans Supabase et
            les gérer depuis ce tableau de bord.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-stone-950 shadow-sm transition hover:bg-white/90"
          >
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  let rows: DashboardPropertyRow[] = [];
  let loadError: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error: pgError } = await supabase
      .from("properties")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (pgError) {
      loadError =
        pgError.message + (pgError.code ? ` [${pgError.code}]` : "");
      if (
        pgError.code === "42703" ||
        /column|does not exist/i.test(pgError.message)
      ) {
        loadError += PROPERTIES_COLUMN_HINT;
      }
      if (pgError.code === "42P01") {
        loadError +=
          "\n\nTable `properties` absente : exécutez les migrations Supabase du dépôt.";
      }
      if (/permission denied|rls/i.test(pgError.message)) {
        loadError += RLS_CLERK_HINT;
      }
    } else {
      rows = (data ?? []) as DashboardPropertyRow[];
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isFetch =
      e instanceof TypeError &&
      (msg === "fetch failed" || msg.toLowerCase().includes("fetch failed"));
    loadError = isFetch
      ? [
          "Connexion vers Supabase impossible (erreur réseau « fetch failed »). Causes fréquentes :",
          "• NEXT_PUBLIC_SUPABASE_URL incorrecte ou illisible (doit être https://<ref>.supabase.co, sans guillemets ni espace en trop).",
          "• NEXT_PUBLIC_SUPABASE_ANON_KEY manquante ou tronquée en production (Vercel / autre).",
          "• Pare-feu / VPN bloquant l’accès à *.supabase.co.",
          "",
          "Détail technique : " + msg,
        ].join("\n")
      : msg;
  }

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
      <DashboardSupabaseEnvLog />
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
                Portefeuille
              </p>
              <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Mes projets
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
                Tous vos projets enregistrés dans Supabase : nom, ville,
                rentabilité nette et cash-flow mensuel. Ajoutez un projet via le
                formulaire ou le calculateur.
              </p>
            </div>
            <DashboardAddProperty />
          </div>

          {loadError ? (
            <div
              className="mt-8 max-w-3xl whitespace-pre-wrap rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm leading-relaxed text-rose-100"
              role="alert"
            >
              {`Impossible de charger les propriétés.\n\n${loadError}`}
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

          <section className="mt-12" aria-labelledby="projects-heading">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  id="projects-heading"
                  className="font-display text-xl font-semibold tracking-tight text-white"
                >
                  Vos projets
                </h2>
                <p className="mt-1 text-sm text-white/55">
                  Données issues de la table{" "}
                  <span className="font-mono text-white/70">properties</span>.
                </p>
              </div>
              <p className="text-xs font-medium uppercase tracking-widest text-white/40">
                {rows.length} projet{rows.length > 1 ? "s" : ""}
              </p>
            </div>

            {rows.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
                <p className="text-sm text-white/65">
                  Aucun projet pour l&apos;instant. Utilisez{" "}
                  <span className="font-semibold text-white/90">
                    Ajouter un projet
                  </span>{" "}
                  ci-dessus, ou{" "}
                  <Link
                    href="/calculateur"
                    className="font-semibold text-sky-300 underline-offset-4 hover:text-sky-200 hover:underline"
                  >
                    ouvrez le calculateur
                  </Link>{" "}
                  pour une analyse complète puis enregistrez.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}
          </section>

          <section className="mt-14 grid gap-8 lg:grid-cols-3 lg:gap-10">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur lg:col-span-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-semibold tracking-tight text-white">
                    Documents &amp; rapports
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">
                    Exports et dossier bancaire.
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

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur lg:col-span-2">
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
          </section>
        </div>
      </div>
    </main>
  );
}
