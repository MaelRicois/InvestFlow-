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
  if (v === "Bordeaux" || v === "Lyon" || v === "Marseille") return v;
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

  const fallbackListings: DiscoverListing[] =
    source === "apify" && listings.length === 0
      ? MOCK_LISTINGS.map((l) => {
          // Hypothèses simples (pour tester le routing) — à affiner ensuite.
          const monthlyRentEur = Math.round(l.priceEur * 0.0045); // ~0.45%/mois
          const monthlyPropertyTaxEur = 90;
          const monthlyChargesInsuranceEur = 140;
          const row = {
            id: l.id,
            source: "mock" as const,
            city: l.city,
            title: `${l.city} — ${l.surfaceM2} m² · Opportunité test`,
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
