import { computeNetYieldPct } from "./net-yield";
import type { DiscoverListing } from "./types";

const MOCK_BASE: Omit<
  DiscoverListing,
  "estimatedNetYieldPct" | "source" | "raw"
>[] = [
  {
    id: "mock-lyon-studio-optimise-85",
    city: "Lyon",
    title: "Studio optimisé - Rendement 8.5% - Lyon",
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80",
    imageAlt: "Studio optimisé avec cuisine compacte et coin nuit",
    purchasePriceEur: 115_000,
    worksBudgetEur: 4_000,
    monthlyRentEur: 1_090,
    monthlyPropertyTaxEur: 55,
    monthlyChargesInsuranceEur: 75,
  },
  {
    id: "mock-bordeaux-t2-hypercentre",
    city: "Bordeaux",
    title: "T2 Rénové - Hyper-centre Bordeaux",
    imageUrl:
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&q=80",
    imageAlt: "Salon cocooning avec lumière chaude et parquet",
    purchasePriceEur: 210_000,
    worksBudgetEur: 12_000,
    monthlyRentEur: 1_575,
    monthlyPropertyTaxEur: 95,
    monthlyChargesInsuranceEur: 150,
  },
  {
    id: "mock-lille-immeuble-colocation",
    city: "Lille",
    title: "Immeuble de rapport - Spécial Colocation - Lille",
    imageUrl:
      "https://images.unsplash.com/photo-1527030280862-64139fba04ca?w=900&q=80",
    imageAlt: "Façade d'immeuble en ville, style haussmannien",
    purchasePriceEur: 320_000,
    worksBudgetEur: 25_000,
    monthlyRentEur: 2_785,
    monthlyPropertyTaxEur: 160,
    monthlyChargesInsuranceEur: 260,
  },
  {
    id: "mock-marseille-t3-vue-mer",
    city: "Marseille",
    title: "Appartement T3 - Vue Mer - Marseille",
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80",
    imageAlt: "Salon lumineux avec grandes ouvertures et vue dégagée",
    purchasePriceEur: 245_000,
    worksBudgetEur: 8_000,
    monthlyRentEur: 1_700,
    monthlyPropertyTaxEur: 105,
    monthlyChargesInsuranceEur: 190,
  },
  {
    id: "mock-toulouse-studio-etudiant-lmnp",
    city: "Toulouse",
    title: "Studio étudiant - Idéal LMNP - Toulouse",
    imageUrl:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=900&q=80",
    imageAlt: "Cuisine moderne et compacte, idéale meublé étudiant",
    purchasePriceEur: 102_000,
    worksBudgetEur: 3_000,
    monthlyRentEur: 1_005,
    monthlyPropertyTaxEur: 45,
    monthlyChargesInsuranceEur: 70,
  },
  {
    id: "mock-nantes-t2-proche-metro",
    city: "Nantes",
    title: "T2 Lumineux - Proche Métro - Nantes",
    imageUrl:
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=900&q=80",
    imageAlt: "Séjour lumineux avec grandes fenêtres et déco contemporaine",
    purchasePriceEur: 165_000,
    worksBudgetEur: 6_000,
    monthlyRentEur: 1_300,
    monthlyPropertyTaxEur: 80,
    monthlyChargesInsuranceEur: 125,
  },
];

export function getMockDiscoverListings(): DiscoverListing[] {
  return MOCK_BASE.map((row) => ({
    ...row,
    source: "mock" as const,
    estimatedNetYieldPct: computeNetYieldPct(row),
  }));
}
