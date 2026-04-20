"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function numParam(sp: URLSearchParams, key: string) {
  const raw = sp.get(key);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export default function CalculatorAliasPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CalculatorAliasInner />
    </Suspense>
  );
}

function CalculatorAliasInner() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const price = numParam(sp, "price");
    const city = sp.get("city") ?? "";
    const surface = numParam(sp, "surface");

    const out = new URLSearchParams();
    if (price != null) out.set("purchase_price", String(Math.round(price)));
    if (city.trim()) {
      const label =
        surface != null
          ? `${city.trim()} — ${Math.round(surface)} m²`
          : city.trim();
      out.set("name", label);
    }
    // Note: img conservé dans l’URL /calculator mais le calculateur n’en a pas besoin.
    router.replace(`/calculateur?${out.toString()}`);
  }, [router, sp]);

  return <Loading />;
}

function Loading() {
  return (
    <main className="flex-1 bg-stone-50">
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-sm font-medium text-stone-700">
          Ouverture du calculateur…
        </p>
        <p className="mt-2 text-sm text-stone-500">
          Pré-remplissage en cours à partir de l’annonce.
        </p>
      </div>
    </main>
  );
}

