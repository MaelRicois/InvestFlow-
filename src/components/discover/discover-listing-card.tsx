 "use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Sparkles } from "lucide-react";
import type { DiscoverListing } from "@/lib/discover/types";
import { Card, CardContent } from "@/components/ui/card";

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPct(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(value / 100);
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function DiscoverListingCard({ listing }: { listing: DiscoverListing }) {
  const router = useRouter();
  const yieldTone =
    listing.estimatedNetYieldPct >= 4.5
      ? "text-emerald-700"
      : listing.estimatedNetYieldPct >= 3.5
        ? "text-amber-800"
        : "text-stone-700";

  return (
    <Card className="overflow-hidden border-stone-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] w-full bg-stone-200">
        <Image
          src={listing.imageUrl}
          alt={listing.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-stone-800 shadow-sm backdrop-blur-sm">
          {listing.city}
        </div>
      </div>
      <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="space-y-2">
          <h2 className="font-display text-lg font-semibold leading-snug text-stone-900">
            {listing.title}
          </h2>
          <p className="flex items-center gap-1.5 text-sm text-stone-500">
            <MapPin className="size-3.5 shrink-0 text-stone-400" aria-hidden />
            {listing.city}
            {typeof listing.surfaceM2 === "number" ? (
              <span className="text-stone-400">·</span>
            ) : null}
            {typeof listing.surfaceM2 === "number" ? (
              <span className="font-medium text-stone-600">
                {listing.surfaceM2} m²
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-stone-100 pt-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              Prix annoncé
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-stone-900">
              {formatEUR(listing.purchasePriceEur)}
            </p>
          </div>
          <div className="text-right">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-stone-400">
              <Sparkles className="size-3.5 text-amber-600" aria-hidden />
              Rendement net estimé
            </p>
            <p
              className={cx(
                "mt-1 text-2xl font-semibold tabular-nums tracking-tight",
                yieldTone
              )}
            >
              {formatPct(listing.estimatedNetYieldPct)}
            </p>
            <p className="mt-1 max-w-[14rem] text-[11px] leading-snug text-stone-500">
              Hypothèses alignées sur le calculateur (notaire 8&nbsp;%, vacance
              5&nbsp;%, charges saisies).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const params = new URLSearchParams();
            params.set("price", String(Math.round(listing.purchasePriceEur)));
            params.set("city", listing.city);
            params.set("img", listing.imageUrl);
            if (typeof listing.surfaceM2 === "number") {
              params.set("surface", String(Math.round(listing.surfaceM2)));
            }
            router.push(`/calculator?${params.toString()}`);
          }}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-semibold text-amber-50 shadow-sm transition-colors hover:bg-stone-800"
        >
          Analyser le rendement
        </button>
      </CardContent>
    </Card>
  );
}
