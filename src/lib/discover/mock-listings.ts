import { computeNetYieldPct } from "./net-yield";
import type { DiscoverListing } from "./types";

const MOCK_BASE: Omit<
  DiscoverListing,
  "estimatedNetYieldPct" | "source" | "raw"
>[] = [
  {
    id: "mock-bordeaux-chartrons-t2",
    city: "Bordeaux",
    title:
      "T2 lumineux Chartrons — parquet, cave, proche tram",
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80",
    imageAlt: "Intérieur d'appartement lumineux avec grandes fenêtres",
    purchasePriceEur: 198_000,
    worksBudgetEur: 12_000,
    monthlyRentEur: 920,
    monthlyPropertyTaxEur: 92,
    monthlyChargesInsuranceEur: 135,
  },
  {
    id: "mock-bordeaux-bacalan-studio",
    city: "Bordeaux",
    title: "Studio investisseur Bacalan — loué meublé, bon état",
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80",
    imageAlt: "Studio moderne avec canapé et cuisine ouverte",
    purchasePriceEur: 112_000,
    worksBudgetEur: 4_500,
    monthlyRentEur: 540,
    monthlyPropertyTaxEur: 48,
    monthlyChargesInsuranceEur: 72,
  },
  {
    id: "mock-lyon-croix-rousse-t3",
    city: "Lyon",
    title: "T3 Croix-Rousse — poutres apparentes, sans vis-à-vis",
    imageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80",
    imageAlt: "Salon avec poutres au plafond et baie vitrée",
    purchasePriceEur: 352_000,
    worksBudgetEur: 18_000,
    monthlyRentEur: 1_280,
    monthlyPropertyTaxEur: 138,
    monthlyChargesInsuranceEur: 220,
  },
  {
    id: "mock-lyon-guillotiere-t2",
    city: "Lyon",
    title: "T2 Guillotière — idéal colocation, proximité métro B",
    imageUrl:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=80",
    imageAlt: "Pièce à vivre avec parquet et mobilier contemporain",
    purchasePriceEur: 215_000,
    worksBudgetEur: 8_000,
    monthlyRentEur: 980,
    monthlyPropertyTaxEur: 88,
    monthlyChargesInsuranceEur: 155,
  },
  {
    id: "mock-marseille-plateau-t3",
    city: "Marseille",
    title: "T3 Le Plateau — vue dégagée, double vitrage récent",
    imageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80",
    imageAlt: "Terrasse avec vue sur ville en fin de journée",
    purchasePriceEur: 268_000,
    worksBudgetEur: 14_000,
    monthlyRentEur: 1_050,
    monthlyPropertyTaxEur: 102,
    monthlyChargesInsuranceEur: 185,
  },
];

export function getMockDiscoverListings(): DiscoverListing[] {
  return MOCK_BASE.map((row) => ({
    ...row,
    source: "mock" as const,
    estimatedNetYieldPct: computeNetYieldPct(row),
  }));
}
