import { computeNetYieldPct } from "./net-yield";
import type { DiscoverCity, DiscoverListing } from "./types";

export const SELOGER_MASS_PRODUCTS_ACTOR_ID =
  "azzouzana/seloger-mass-products-scraper-by-search-url";

const DISCOVER_CITIES: DiscoverCity[] = [
  "Bordeaux",
  "Lille",
  "Lyon",
  "Marseille",
  "Nantes",
  "Toulouse",
];

/** Ordre de grandeur loyer €/m²/mois (estimation marché location) pour dériver un loyer si absent de l’annonce vente. */
const RENT_EUR_PER_M2_MONTH: Record<DiscoverCity, number> = {
  Bordeaux: 14,
  Lille: 13.5,
  Lyon: 15.5,
  Marseille: 12.5,
  Nantes: 13.8,
  Toulouse: 12.5,
};

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/**
 * Génère une URL de recherche SeLoger simple pour une ville.
 * Exemple : https://www.seloger.com/classified-search?distributionTypes=Buy&estateTypes=Apartment&locations=[Bordeaux]
 */
export function buildSeLogerUrl(city: DiscoverCity): string {
  const base = "https://www.seloger.com/classified-search";
  const params = new URLSearchParams({
    distributionTypes: "Buy",
    estateTypes: "Apartment",
    locations: `[${city}]`,
  });
  return `${base}?${params.toString()}`;
}

/**
 * Rattache une ville API à Bordeaux / Lyon / Marseille (filtres Discover).
 * Sinon on retombe sur la ville ciblée par la requête Apify.
 */
export function resolveDiscoverCity(
  apiCity: string,
  fallback: DiscoverCity
): DiscoverCity {
  const n = normalizeText(apiCity);
  if (n.includes("marseille")) return "Marseille";
  if (n.includes("toulouse")) return "Toulouse";
  if (n.includes("nantes")) return "Nantes";
  if (n.includes("lille")) return "Lille";
  if (
    n.includes("lyon") ||
    n.includes("villeurbanne") ||
    n.includes("caluire") ||
    n.includes("venissieux")
  ) {
    return "Lyon";
  }
  if (
    n.includes("bordeaux") ||
    n.includes("merignac") ||
    n.includes("pessac") ||
    n.includes("begles") ||
    n.includes("talence") ||
    n.includes("cenon")
  ) {
    return "Bordeaux";
  }
  return fallback;
}

function pickPrice(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return raw;
  if (Array.isArray(raw) && raw.length > 0) {
    const n = Number(raw[0]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function apifyRunSyncUrl(token: string): string {
  const encoded = encodeURIComponent(token);
  return `https://api.apify.com/v2/acts/azzouzana~seloger-mass-products-scraper-by-search-url/run-sync-get-dataset-items?token=${encoded}`;
}

function pickId(raw: Record<string, unknown>): string | null {
  const candidates: unknown[] = [
    raw.id,
    raw.listingId,
    raw.list_id,
    raw.listId,
    raw.permalink, // fallback (unique-ish) if actor doesn't return an id
    raw.url,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
    if (typeof c === "number" && Number.isFinite(c) && c > 0) return String(c);
  }
  return null;
}

function getLocationCity(loc: unknown): string {
  if (loc && typeof loc === "object" && "city" in loc) {
    const c = (loc as { city?: unknown }).city;
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return "";
}

function parseAmountFromHardFacts(hardFacts: unknown): number {
  if (!Array.isArray(hardFacts)) return 0;
  for (const f of hardFacts) {
    if (!f || typeof f !== "object") continue;
    const o = f as { label?: unknown; key?: unknown; value?: unknown };
    const label =
      typeof o.label === "string"
        ? o.label
        : typeof o.key === "string"
          ? o.key
          : "";
    if (!label) continue;
    const nLabel = normalizeText(label);
    if (!nLabel.includes("prix")) continue;
    const v = o.value;
    if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
    if (typeof v === "string" && v.trim()) {
      const digits = v.replace(/\D/g, "");
      if (digits) {
        const n = Number(digits);
        if (Number.isFinite(n) && n > 0) return n;
      }
    }
  }
  return 0;
}

function getAttributeNumber(
  attributes: unknown,
  key: string
): number | null {
  if (!Array.isArray(attributes)) return null;
  for (const a of attributes) {
    if (!a || typeof a !== "object") continue;
    const o = a as { key?: string; value?: unknown };
    if (o.key !== key) continue;
    if (typeof o.value === "string") {
      const n = parseFloat(o.value.replace(",", "."));
      if (Number.isFinite(n) && n > 0) return n;
    }
    if (typeof o.value === "number" && Number.isFinite(o.value)) {
      return o.value;
    }
  }
  return null;
}

function pickFirstImageUrlFromGallery(gallery: unknown): string | null {
  if (!Array.isArray(gallery) || gallery.length === 0) return null;
  const first = gallery[0] as unknown;
  if (typeof first === "string" && first.trim()) return first.trim();
  if (first && typeof first === "object") {
    const o = first as { url?: unknown; src?: unknown; uri?: unknown };
    const candidates = [o.url, o.src, o.uri];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim()) return c.trim();
    }
  }
  return null;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80";

function estimateMonthlyCharges(monthlyRent: number): number {
  return Math.max(90, Math.round(monthlyRent * 0.12));
}

function estimateMonthlyPropertyTax(
  purchasePrice: number,
  attributes: unknown
): number {
  const annualFromAttrs = (() => {
    if (!Array.isArray(attributes)) return null;
    const keys = new Set([
      "property_tax",
      "property_taxes",
      "taxe_fonciere",
      "real_estate_tax",
    ]);
    for (const a of attributes) {
      if (!a || typeof a !== "object") continue;
      const o = a as { key?: string; value?: unknown; value_label?: unknown };
      if (o.key && keys.has(o.key)) {
        const raw =
          typeof o.value === "string"
            ? o.value
            : typeof o.value_label === "string"
              ? o.value_label
              : "";
        const digits = raw.replace(/\D/g, "");
        if (digits) {
          const n = Number(digits);
          if (Number.isFinite(n) && n > 0) return Math.round(n / 12);
        }
      }
    }
    return null;
  })();

  if (annualFromAttrs != null) return annualFromAttrs;
  return Math.round((purchasePrice * 0.0065) / 12);
}

function estimateMonthlyRent(
  purchasePrice: number,
  surfaceM2: number | null,
  city: DiscoverCity
): number {
  if (surfaceM2 != null && surfaceM2 >= 9) {
    const rate = RENT_EUR_PER_M2_MONTH[city];
    return Math.round(surfaceM2 * rate);
  }
  return Math.round(purchasePrice * 0.00038);
}

/**
 * Transforme un item dataset SeLoger (acteur `seloger-mass-products-scraper-by-search-url`) vers `DiscoverListing`.
 * `targetCity` = ville de la requête Apify (repli si `location.city` ne matche pas les trois métropoles).
 */
export function mapApifyItemToDiscoverListing(
  raw: Record<string, unknown>,
  targetCity: DiscoverCity
): DiscoverListing | null {
  const id = pickId(raw);
  if (!id) return null;

  const priceObj =
    raw.price && typeof raw.price === "object" && !Array.isArray(raw.price)
      ? (raw.price as { amount?: unknown }).amount
      : undefined;
  const purchasePriceEur =
    pickPrice(priceObj) || pickPrice(raw.price) || parseAmountFromHardFacts(raw.hardFacts);
  if (purchasePriceEur <= 0) return null;

  const titleFromMain =
    raw.mainDescription &&
    typeof raw.mainDescription === "object" &&
    !Array.isArray(raw.mainDescription) &&
    "title" in raw.mainDescription
      ? (raw.mainDescription as { title?: unknown }).title
      : undefined;
  const title =
    typeof titleFromMain === "string" && titleFromMain.trim()
      ? titleFromMain.trim()
      : "Annonce SeLoger";

  const apiCity = getLocationCity(raw.location);
  const city = apiCity
    ? resolveDiscoverCity(apiCity, targetCity)
    : targetCity;

  const imageUrl =
    pickFirstImageUrlFromGallery(raw.gallery) ?? PLACEHOLDER_IMAGE;

  const surfaceM2 =
    getAttributeNumber(raw.hardFacts, "surface") ??
    getAttributeNumber(raw.attributes, "square");
  const monthlyRentEur = estimateMonthlyRent(
    purchasePriceEur,
    surfaceM2,
    city
  );
  const monthlyPropertyTaxEur = estimateMonthlyPropertyTax(
    purchasePriceEur,
    raw.hardFacts ?? raw.attributes
  );
  const monthlyChargesInsuranceEur = estimateMonthlyCharges(monthlyRentEur);
  const worksBudgetEur = 0;

  const estimatedNetYieldPct = computeNetYieldPct({
    purchasePriceEur,
    worksBudgetEur,
    monthlyRentEur,
    monthlyPropertyTaxEur,
    monthlyChargesInsuranceEur,
  });

  return {
    id: `apify-seloger-${id}`,
    source: "apify",
    city,
    title,
    imageUrl,
    imageAlt: title,
    purchasePriceEur,
    worksBudgetEur,
    monthlyRentEur,
    monthlyPropertyTaxEur,
    monthlyChargesInsuranceEur,
    estimatedNetYieldPct,
    raw,
  };
}

async function runActorForCity(
  token: string,
  targetCity: DiscoverCity
): Promise<Record<string, unknown>[]> {
  const url = buildSeLogerUrl(targetCity);
  const res = await fetch(apifyRunSyncUrl(token), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ startUrl: url, maxItems: 10 }),
    // run-sync can be long; avoid caching surprises in Next.
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Apify run-sync failed (${res.status}): ${text.slice(0, 600)}`
    );
  }

  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is Record<string, unknown> =>
      !!item && typeof item === "object" && !Array.isArray(item)
  );
}

/**
 * Lance l’acteur Apify pour les villes demandées (par défaut Bordeaux, Lyon, Marseille),
 * fusionne les résultats et calcule le rendement net estimé pour chaque annonce.
 */
export async function fetchDiscoverListingsFromApify(
  selectedCities?: DiscoverCity[]
): Promise<DiscoverListing[]> {
  const token = process.env.APIFY_API_TOKEN?.trim();
  if (!token) {
    console.error(
      "[discover] APIFY_API_TOKEN manquant : impossible de charger les annonces Apify."
    );
    return [];
  }

  const cities: DiscoverCity[] =
    selectedCities != null && selectedCities.length > 0
      ? selectedCities
      : DISCOVER_CITIES;

  try {
    const batches = await Promise.all(
      cities.map((city) => runActorForCity(token, city))
    );

    const merged = new Map<string, DiscoverListing>();

    for (let i = 0; i < batches.length; i++) {
      const targetCity = cities[i]!;
      const batch = batches[i]!;
      for (const raw of batch) {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
        const mapped = mapApifyItemToDiscoverListing(raw, targetCity);
        if (!mapped) continue;
        if (!merged.has(mapped.id)) merged.set(mapped.id, mapped);
      }
    }

    return Array.from(merged.values()).sort(
      (a, b) => b.estimatedNetYieldPct - a.estimatedNetYieldPct
    );
  } catch (e) {
    console.error("[discover] Erreur Apify SeLoger:", e);
    return [];
  }
}
