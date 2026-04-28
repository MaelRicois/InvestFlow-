import type { Metadata } from "next";
import { DiscoverFeed } from "@/components/discover/discover-feed";
import { getDiscoverListingsWithMeta } from "@/lib/discover/get-listings";
import type { DiscoverCity } from "@/lib/discover/types";
import type { DiscoverListingsSource } from "@/lib/discover/get-listings";
import { MOCK_LISTINGS } from "@/lib/mock-listings";
import { computeNetYieldPct } from "@/lib/discover/net-yield";
import type { DiscoverListing } from "@/lib/discover/types";

/** Évite de figer les annonces Apify au build ; les données sont chargées à la requête. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Découvrir",
  description:
    "Flux d’annonces immobilières avec estimation de rendement net et lien vers le calculateur.",
};

function parseDiscoverVilleParam(
  raw: string | string[] | undefined
): DiscoverCity | null {
  if (raw == null) return null;
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (
    v === "Bordeaux" ||
    v === "Lille" ||
    v === "Lyon" ||
    v === "Marseille" ||
    v === "Nantes" ||
    v === "Toulouse"
  )
    return v;
  return null;
}

type DiscoverPageProps = {
  searchParams?: Promise<{ ville?: string | string[] }>;
};

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const sp = searchParams != null ? await searchParams : {};
  const ville = parseDiscoverVilleParam(sp.ville);
  const source = (process.env.DISCOVER_LISTINGS_SOURCE ??
    "mock") as DiscoverListingsSource;
  const { listings, meta } = await getDiscoverListingsWithMeta({
    apifyCities: ville != null ? [ville] : undefined,
  });

  const showRecentPicksBanner =
    meta.origin === "mock" || (source === "apify" && listings.length === 0);

  const fallbackListings: DiscoverListing[] =
    source === "apify" && listings.length === 0
      ? MOCK_LISTINGS.map((l) => {
          // Hypothèses simples (pour remplir la page quand Apify est en pause).
          // Objectif: un rendement net "cliquable" (≈ 5–9%).
          const baseRentFactor = l.city === "Lyon" ? 0.0062 : 0.0068;
          const monthlyRentEur = Math.round(l.priceEur * baseRentFactor);
          const monthlyPropertyTaxEur = Math.round(l.priceEur * 0.00035);
          const monthlyChargesInsuranceEur = Math.round(l.priceEur * 0.00045);

          const titleById: Record<string, string> = {
            "mock-bdx-studio-campus-24m2-110k":
              "Studio rendement 8% proche facs — meublé, prêt à louer",
            "mock-lyon-t2-historique-38m2-185k":
              "T2 rénové quartier historique — idéal LCD / meublé",
            "mock-mrs-t2-meuble-34m2-149k":
              "T2 meublé à forte demande — proche transports",
            "mock-bdx-t2-tram-44m2-172k":
              "T2 proche tram — extérieur, locataire easy",
            "mock-lyon-t3-famille-63m2-299k":
              "T3 familial — secteur recherché, peu de vacances",
            "mock-mrs-immeuble-rapport-0m2-239k":
              "Immeuble de rapport centre-ville — 3 lots, cash-flow potentiel",
          };

          const row = {
            id: l.id,
            source: "mock" as const,
            city: l.city,
            title:
              titleById[l.id] ??
              `${l.city} — Opportunité sélectionnée récemment`,
            surfaceM2: l.surfaceM2,
            imageUrl: l.imageUrl,
            imageAlt: `Annonce test ${l.city}`,
            purchasePriceEur: l.priceEur,
            worksBudgetEur: 0,
            monthlyRentEur,
            monthlyPropertyTaxEur,
            monthlyChargesInsuranceEur,
          };
          return {
            ...row,
            estimatedNetYieldPct: computeNetYieldPct(row),
          };
        })
      : listings;

  return (
    <main className="flex-1 bg-gradient-to-b from-stone-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            Flux
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Découvrir des opportunités
          </h1>
          <p className="mt-3 text-sm text-stone-600 sm:text-base">
            Annonces sélectionnées avec une estimation automatique du rendement
            net. Filtrez en direct, puis ouvrez le calculateur pour affiner le
            financement et le cash-flow.
          </p>
        </div>

        {showRecentPicksBanner ? (
          <div className="mt-8 rounded-2xl border border-stone-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-sm font-semibold text-stone-800">
              📍 Sélection de pépites détectées par notre IA
            </p>
          </div>
        ) : null}

        <DiscoverFeed
          listings={fallbackListings}
          cityFilterFromUrl={ville != null ? ville : "all"}
          source={source}
          cacheMeta={meta}
        />
      </div>
    </main>
  );
}
