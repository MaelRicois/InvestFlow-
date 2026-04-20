import { fetchDiscoverListingsFromApify } from "./apify";
import { getMockDiscoverListings } from "./mock-listings";
import type { DiscoverCity, DiscoverListing } from "./types";
import { createAdminClient } from "@/lib/supabase/admin";

export type DiscoverListingsSource = "mock" | "apify";

export type DiscoverCacheMeta = {
  origin: "cache" | "apify" | "mock";
  /** minutes depuis la génération (cache) ou 0 si tout juste rafraîchi */
  ageMinutes: number;
  city: DiscoverCity | "all";
};

function isApifyRateLimitError(e: unknown): boolean {
  const msg =
    e instanceof Error
      ? e.message
      : typeof e === "string"
        ? e
        : e && typeof e === "object" && "message" in e
          ? String((e as { message?: unknown }).message)
          : "";

  const m = msg.toLowerCase();
  return (
    m.includes("rate limit") ||
    m.includes("too many requests") ||
    m.includes("429") ||
    (m.includes("apify") && m.includes("limit"))
  );
}

type ListingsCacheRow = {
  city: string;
  data: unknown;
  created_at: string;
};

function minutesSince(iso: string) {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return null;
  const diffMs = Date.now() - ts;
  return diffMs >= 0 ? Math.floor(diffMs / 60000) : 0;
}

function isFresh(createdAtIso: string, maxAgeHours: number) {
  const m = minutesSince(createdAtIso);
  if (m == null) return false;
  return m <= maxAgeHours * 60;
}

async function readCityCache(city: DiscoverCity) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("listings_cache")
      .select("city,data,created_at")
      .eq("city", city)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return data as ListingsCacheRow;
  } catch {
    return null;
  }
}

async function writeCityCache(city: DiscoverCity, listings: DiscoverListing[]) {
  try {
    const supabase = createAdminClient();
    await supabase.from("listings_cache").upsert(
      {
        city,
        data: listings,
        created_at: new Date().toISOString(),
      },
      { onConflict: "city" }
    );
  } catch {
    // cache best-effort
  }
}

async function fetchDiscoverListings(options?: {
  apifyCities?: DiscoverCity[];
}): Promise<{ listings: DiscoverListing[]; meta: DiscoverCacheMeta }> {
  const source = (process.env.DISCOVER_LISTINGS_SOURCE ??
    "mock") as DiscoverListingsSource;

  const selected = options?.apifyCities?.length ? options.apifyCities : null;
  const cityLabel: DiscoverCity | "all" =
    selected != null && selected.length === 1 ? selected[0]! : "all";

  if (source !== "apify") {
    return {
      listings: getMockDiscoverListings(),
      meta: { origin: "mock", ageMinutes: 0, city: cityLabel },
    };
  }

  // Cache DB only for a single city filter (keeps it simple + avoids mixing timestamps).
  if (cityLabel !== "all") {
    const cached = await readCityCache(cityLabel);
    if (
      cached &&
      isFresh(cached.created_at, 24) &&
      Array.isArray(cached.data) &&
      cached.data.length > 0
    ) {
      const age = minutesSince(cached.created_at) ?? 0;
      return {
        listings: cached.data as DiscoverListing[],
        meta: { origin: "cache", ageMinutes: age, city: cityLabel },
      };
    }
  }

  try {
    const listings = await fetchDiscoverListingsFromApify(
      selected != null ? selected : undefined
    );
    if (cityLabel !== "all") {
      await writeCityCache(cityLabel, listings);
    }
    return { listings, meta: { origin: "apify", ageMinutes: 0, city: cityLabel } };
  } catch (e) {
    if (isApifyRateLimitError(e)) {
      console.warn("[discover] Apify rate limited; returning [] as fallback.");
      return { listings: [], meta: { origin: "apify", ageMinutes: 0, city: cityLabel } };
    }
    console.error("[discover] Apify fetch failed; using mocks as fallback.", e);
    return {
      listings: getMockDiscoverListings(),
      meta: { origin: "mock", ageMinutes: 0, city: cityLabel },
    };
  }
}

/**
 * Source des annonces : `mock` par défaut, ou `apify` si
 * `DISCOVER_LISTINGS_SOURCE=apify` + `APIFY_API_TOKEN` (voir `.env.local`).
 *
 * `apifyCities` : villes à interroger côté Apify (aligné sur le filtre « Ville » via `?ville=`).
 */
export async function getDiscoverListings(options?: {
  apifyCities?: DiscoverCity[];
}): Promise<DiscoverListing[]> {
  const { listings } = await fetchDiscoverListings(options);
  return listings;
}

export async function getDiscoverListingsWithMeta(options?: {
  apifyCities?: DiscoverCity[];
}): Promise<{ listings: DiscoverListing[]; meta: DiscoverCacheMeta }> {
  return fetchDiscoverListings(options);
}
