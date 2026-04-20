"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useClerkSupabase } from "@/lib/supabase/clerk-browser";
import { MapPin, Trash2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buildCalculateurHrefFromProperty } from "@/lib/dashboard/calculateur-href";
import type { DashboardPropertyRow } from "@/lib/dashboard/types";

export type DashboardProperty = DashboardPropertyRow;

function toNum(v: number | string | null | undefined) {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPctFromStored(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(value / 100);
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function PropertyCard({ property }: { property: DashboardProperty }) {
  const router = useRouter();
  const supabase = useClerkSupabase();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const cf = toNum(property.monthly_cashflow);
  const yieldPct = toNum(property.net_yield);
  const displayName = property.name?.trim() || "Sans nom";
  const city =
    property.city != null && String(property.city).trim() !== ""
      ? String(property.city).trim()
      : null;

  async function handleDelete() {
    if (!window.confirm("Supprimer ce bien ? Cette action est définitive.")) {
      return;
    }
    setDeleteError(null);
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", property.id);
      if (error) {
        setDeleteError(error.message);
        return;
      }
      router.refresh();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className="h-full border-stone-200/80 bg-white transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-5 py-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              Projet
            </p>
            <Link
              href={buildCalculateurHrefFromProperty(property)}
              className="font-display block text-lg font-semibold leading-snug text-stone-900 underline-offset-4 transition-colors hover:text-amber-900 hover:underline"
            >
              {displayName}
            </Link>
            {city ? (
              <p className="flex items-center gap-1.5 text-sm text-stone-500">
                <MapPin
                  className="size-3.5 shrink-0 text-stone-400"
                  aria-hidden
                />
                {city}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Supprimer ce bien"
            className={cx(
              "shrink-0 rounded-xl p-2.5 text-red-600 transition-colors",
              "hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            <Trash2 className="size-5" aria-hidden />
          </button>
        </div>

        {deleteError ? (
          <p className="text-xs text-red-600" role="alert">
            {deleteError}
          </p>
        ) : null}

        <div className="mt-auto rounded-xl border border-stone-100 bg-stone-50/80 px-4 py-4">
          <p className="text-xs font-medium text-stone-500">
            Cash-flow mensuel
          </p>
          <p
            className={cx(
              "mt-1 text-2xl font-semibold tabular-nums tracking-tight",
              cf > 0 ? "text-emerald-600" : cf < 0 ? "text-red-600" : "text-stone-800"
            )}
          >
            {formatEUR(cf)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
          <span className="text-xs font-medium uppercase tracking-wide text-stone-400">
            Rendement net
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums text-stone-800">
            <TrendingUp
              className="size-4 text-amber-700/90"
              aria-hidden
            />
            {formatPctFromStored(yieldPct)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
