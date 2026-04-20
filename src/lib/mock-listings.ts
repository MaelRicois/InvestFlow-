export type MockListing = {
  id: string;
  city: "Bordeaux" | "Lyon" | "Marseille";
  surfaceM2: number;
  priceEur: number;
  imageUrl: string;
};

export const MOCK_LISTINGS: MockListing[] = [
  {
    id: "test-bdx-t2-52m2-220k",
    city: "Bordeaux",
    surfaceM2: 52,
    priceEur: 220_000,
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
  },
  {
    id: "test-lyon-studio-22m2-145k",
    city: "Lyon",
    surfaceM2: 22,
    priceEur: 145_000,
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
  },
  {
    id: "test-mrs-t3-68m2-265k",
    city: "Marseille",
    surfaceM2: 68,
    priceEur: 265_000,
    imageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
  },
];

