export type DiscoverCity = "Bordeaux" | "Lyon" | "Marseille";

export type DiscoverListingSource = "mock" | "apify";

/**
 * Modèle normalisé pour le flux « Découvrir ».
 * Une source externe (ex. Apify) doit mapper ses champs vers ce type.
 */
export type DiscoverListing = {
  id: string;
  source: DiscoverListingSource;
  city: DiscoverCity;
  title: string;
  surfaceM2?: number;
  imageUrl: string;
  imageAlt: string;
  purchasePriceEur: number;
  worksBudgetEur: number;
  monthlyRentEur: number;
  monthlyPropertyTaxEur: number;
  monthlyChargesInsuranceEur: number;
  /** Rendement net (loyer net de charges annualisé / coût total projet), cohérent avec le calculateur. */
  estimatedNetYieldPct: number;
  /** Données brutes du connecteur (Apify, etc.) pour debug ou champs additionnels futurs. */
  raw?: Record<string, unknown>;
};
