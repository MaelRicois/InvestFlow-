export type MockListing = {
  id: string;
  city: "Bordeaux" | "Lille" | "Lyon" | "Marseille" | "Nantes" | "Toulouse";
  surfaceM2: number;
  priceEur: number;
  imageUrl: string;
};

export const MOCK_LISTINGS: MockListing[] = [
  {
    id: "mock-lyon-studio-optimise-85",
    city: "Lyon",
    surfaceM2: 19,
    priceEur: 115_000,
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
  },
  {
    id: "mock-bordeaux-t2-hypercentre",
    city: "Bordeaux",
    surfaceM2: 41,
    priceEur: 210_000,
    imageUrl:
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&q=80",
  },
  {
    id: "mock-lille-immeuble-colocation",
    city: "Lille",
    surfaceM2: 0,
    priceEur: 320_000,
    imageUrl:
      "https://images.unsplash.com/photo-1527030280862-64139fba04ca?w=1200&q=80",
  },
  {
    id: "mock-marseille-t3-vue-mer",
    city: "Marseille",
    surfaceM2: 63,
    priceEur: 245_000,
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80",
  },
  {
    id: "mock-toulouse-studio-etudiant-lmnp",
    city: "Toulouse",
    surfaceM2: 21,
    priceEur: 102_000,
    imageUrl:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=80",
  },
  {
    id: "mock-nantes-t2-proche-metro",
    city: "Nantes",
    surfaceM2: 46,
    priceEur: 165_000,
    imageUrl:
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200&q=80",
  },
];

