"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowDownWideNarrow,
  ChevronDown,
  Euro,
  MapPin,
  Percent,
} from "lucide-react";
import type { DiscoverCity, DiscoverListing } from "@/lib/discover/types";
import { DiscoverListingCard } from "./discover-listing-card";
import type { DiscoverListingsSource } from "@/lib/discover/get-listings";
import type { DiscoverCacheMeta } from "@/lib/discover/get-listings";

type CityFilter = "all" | DiscoverCity;

type SortOption = "yield_desc" | "price_asc";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Extrait les chiffres et reconstruit un montant en euros (pas de décimales). */
function digitsToEuroAmount(digits: string): number | null {
  if (digits === "") return null;
  const n = Number(digits);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function formatEurosGrouped(digits: string): string {
  if (digits === "") return "";
  const n = Number(digits);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(n);
}

function parseYieldInput(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function filterAndSort(
  listings: DiscoverListing[],
  city: CityFilter,
  maxBudgetEur: number | null,
  minYieldPct: number | null,
  sort: SortOption
): DiscoverListing[] {
  let out = listings.filter((l) => {
    if (city !== "all" && l.city !== city) return false;
    if (maxBudgetEur != null && l.purchasePriceEur > maxBudgetEur) return false;
    if (minYieldPct != null && l.estimatedNetYieldPct < minYieldPct)
      return false;
    return true;
  });

  out = [...out].sort((a, b) => {
    if (sort === "yield_desc") {
      return b.estimatedNetYieldPct - a.estimatedNetYieldPct;
    }
    return a.purchasePriceEur - b.purchasePriceEur;
  });

  return out;
}

const inputClass = cx(
  "h-10 w-full min-w-0 rounded-lg border border-stone-200/90 bg-white px-3 text-sm text-stone-900 shadow-sm outline-none transition",
  "placeholder:text-stone-400",
  "focus:border-stone-300 focus:ring-2 focus:ring-stone-200/80"
);

const labelClass = "mb-1.5 block text-xs font-medium text-stone-500";

export function DiscoverFeed({
  listings,
  cityFilterFromUrl,
  source,
  cacheMeta,
}: {
  listings: DiscoverListing[];
  cityFilterFromUrl: CityFilter;
  source?: DiscoverListingsSource;
  cacheMeta?: DiscoverCacheMeta;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [city, setCity] = useState<CityFilter>(cityFilterFromUrl);

  useEffect(() => {
    setCity(cityFilterFromUrl);
  }, [cityFilterFromUrl]);
  const [budgetDigits, setBudgetDigits] = useState("");
  const [minYieldRaw, setMinYieldRaw] = useState("");
  const [sort, setSort] = useState<SortOption>("yield_desc");

  const maxBudgetEur = useMemo(
    () => digitsToEuroAmount(budgetDigits),
    [budgetDigits]
  );
  const minYieldPct = useMemo(
    () => parseYieldInput(minYieldRaw),
    [minYieldRaw]
  );

  const visible = useMemo(
    () =>
      filterAndSort(listings, city, maxBudgetEur, minYieldPct, sort),
    [listings, city, maxBudgetEur, minYieldPct, sort]
  );

  if (listings.length === 0) {
    return (
      <div className="mt-12 rounded-2xl border border-dashed border-stone-200 bg-stone-50/80 px-6 py-16 text-center">
        <p className="text-sm font-medium text-stone-700">
          Aucune annonce pour le moment.
        </p>
        {source === "apify" ? (
          <p className="mt-2 text-sm text-stone-500">
            Apify est en pause (limite gratuite), réessayez dans quelques minutes
            ou vérifiez votre dashboard.
          </p>
        ) : (
          <p className="mt-2 text-sm text-stone-500">
            Branchez une source (ex. Apify) via{" "}
            <code className="rounded bg-stone-200/80 px-1.5 py-0.5 text-xs">
              DISCOVER_LISTINGS_SOURCE
            </code>{" "}
            et implémentez{" "}
            <code className="rounded bg-stone-200/80 px-1.5 py-0.5 text-xs">
              fetchDiscoverListingsFromApify
            </code>
            .
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {cacheMeta ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-700">
            {cacheMeta.origin === "cache"
              ? "Cache Supabase"
              : cacheMeta.origin === "apify"
                ? "Apify"
                : "Démo"}
          </span>
          {cacheMeta.origin !== "mock" ? (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              Données fraîches{" "}
              <span className="ml-1 font-medium text-emerald-700/80">
                (
                {cacheMeta.ageMinutes <= 0
                  ? "à l’instant"
                  : `il y a ${cacheMeta.ageMinutes} min`}
                )
              </span>
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        className="rounded-xl border border-stone-200/90 bg-stone-100/90 p-4 shadow-sm sm:p-5"
        role="search"
        aria-label="Filtrer les annonces"
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:gap-5">
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="min-w-0 sm:col-span-1">
              <label htmlFor="discover-city" className={labelClass}>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-stone-400" aria-hidden />
                  Ville
                </span>
              </label>
              <div className="relative">
                <select
                  id="discover-city"
                  value={city}
                  onChange={(e) => {
                    const v = e.target.value as CityFilter;
                    setCity(v);
                    const params = new URLSearchParams(
                      typeof window !== "undefined"
                        ? window.location.search
                        : ""
                    );
                    if (v === "all") {
                      params.delete("ville");
                    } else {
                      params.set("ville", v);
                    }
                    const qs = params.toString();
                    router.replace(qs ? `${pathname}?${qs}` : pathname, {
                      scroll: false,
                    });
                  }}
                  className={cx(
                    inputClass,
                    "cursor-pointer appearance-none pr-9 text-stone-800"
                  )}
                >
                  <option value="all">Toutes</option>
                  <option value="Bordeaux">Bordeaux</option>
                  <option value="Lyon">Lyon</option>
                  <option value="Marseille">Marseille</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-stone-400"
                  aria-hidden
                />
              </div>
            </div>

            <div className="min-w-0">
              <label htmlFor="discover-budget" className={labelClass}>
                <span className="inline-flex items-center gap-1.5">
                  <Euro className="size-3.5 text-stone-400" aria-hidden />
                  Budget max
                </span>
              </label>
              <div className="relative">
                <input
                  id="discover-budget"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="ex. 300 000"
                  value={
                    budgetDigits === ""
                      ? ""
                      : `${formatEurosGrouped(budgetDigits)}\u00a0€`
                  }
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "");
                    setBudgetDigits(d);
                  }}
                  className={cx(inputClass, "pl-9 tabular-nums")}
                />
                <Euro
                  className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-400"
                  aria-hidden
                />
              </div>
            </div>

            <div className="min-w-0">
              <label htmlFor="discover-yield" className={labelClass}>
                <span className="inline-flex items-center gap-1.5">
                  <Percent className="size-3.5 text-stone-400" aria-hidden />
                  Rendement min
                </span>
              </label>
              <div className="relative">
                <input
                  id="discover-yield"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="ex. 3,5"
                  value={minYieldRaw}
                  onChange={(e) => setMinYieldRaw(e.target.value)}
                  className={cx(inputClass, "pr-9 tabular-nums")}
                />
                <Percent
                  className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-400"
                  aria-hidden
                />
              </div>
            </div>

            <div className="min-w-0">
              <label htmlFor="discover-sort" className={labelClass}>
                <span className="inline-flex items-center gap-1.5">
                  <ArrowDownWideNarrow
                    className="size-3.5 text-stone-400"
                    aria-hidden
                  />
                  Tri
                </span>
              </label>
              <div className="relative">
                <select
                  id="discover-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className={cx(
                    inputClass,
                    "cursor-pointer appearance-none pr-9 text-stone-800"
                  )}
                >
                  <option value="yield_desc">Plus rentables d&apos;abord</option>
                  <option value="price_asc">Prix croissants</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-stone-400"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/90 px-6 py-14 text-center">
          <p className="text-sm font-medium text-stone-700">
            Aucune pépite trouvée avec ces critères, essayez d&apos;élargir votre
            recherche&nbsp;!
          </p>
        </div>
      ) : (
        <ul className="grid list-none gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {visible.map((listing) => (
            <li key={listing.id}>
              <DiscoverListingCard listing={listing} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
