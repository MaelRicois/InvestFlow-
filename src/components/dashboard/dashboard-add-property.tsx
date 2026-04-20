"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlusCircle, X } from "lucide-react";
import Link from "next/link";
import type { CreditType } from "@/lib/dashboard/property-metrics";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function parseNumber(value: string) {
  const cleaned = value.replace(/\s/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function DashboardAddProperty() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [charges, setCharges] = useState("");
  const [taxMonthly, setTaxMonthly] = useState("");
  const [creditType, setCreditType] = useState<CreditType>("amortissable");

  function reset() {
    setName("");
    setPurchasePrice("");
    setMonthlyRent("");
    setCharges("");
    setTaxMonthly("");
    setCreditType("amortissable");
    setError(null);
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          purchase_price: parseNumber(purchasePrice),
          monthly_rent: parseNumber(monthlyRent),
          charges_monthly: parseNumber(charges),
          tax_monthly: parseNumber(taxMonthly),
          credit_type: creditType,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? `Erreur ${res.status}`);
        return;
      }
      close();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-white px-5 text-sm font-semibold text-stone-950 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.65)] transition hover:bg-white/90 sm:self-auto"
        >
          <PlusCircle className="size-4 shrink-0 opacity-90" aria-hidden />
          Ajouter un bien
        </button>
        <Link
          href="/calculateur"
          className="inline-flex h-11 items-center justify-center self-start rounded-xl border border-white/15 bg-white/[0.04] px-5 text-sm font-semibold text-white/90 transition hover:bg-white/[0.08] sm:self-auto"
        >
          Simulateur complet
        </Link>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-property-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Fermer"
            onClick={close}
          />
          <div
            className={cx(
              "relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10",
              "bg-stone-950 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)]"
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <h2
                  id="add-property-title"
                  className="font-display text-lg font-semibold text-white"
                >
                  Nouveau bien
                </h2>
                <p className="mt-1 text-sm text-white/55">
                  Saisissez les données principales : le cash-flow et le
                  rendement sont calculés automatiquement.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Fermer la fenêtre"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
              <div>
                <label className="block text-sm font-medium text-white/80">
                  Nom du bien
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex. Immeuble Centre-ville"
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80">
                  Prix d&apos;achat (€)
                </label>
                <input
                  required
                  inputMode="decimal"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="250000"
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none tabular-nums placeholder:text-white/35 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80">
                  Loyer mensuel (€)
                </label>
                <input
                  required
                  inputMode="decimal"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  placeholder="1200"
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none tabular-nums placeholder:text-white/35 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/80">
                    Charges (€ / mois)
                  </label>
                  <input
                    inputMode="decimal"
                    value={charges}
                    onChange={(e) => setCharges(e.target.value)}
                    placeholder="160"
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none tabular-nums placeholder:text-white/35 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80">
                    Taxe foncière (€ / mois)
                  </label>
                  <input
                    inputMode="decimal"
                    value={taxMonthly}
                    onChange={(e) => setTaxMonthly(e.target.value)}
                    placeholder="110"
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none tabular-nums placeholder:text-white/35 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80">
                  Type de crédit
                </label>
                <select
                  value={creditType}
                  onChange={(e) =>
                    setCreditType(e.target.value as CreditType)
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-stone-900 px-3 text-sm text-white outline-none focus:border-white/25 focus:ring-2 focus:ring-white/10"
                >
                  <option value="amortissable">Amortissable</option>
                  <option value="in_fine">In fine</option>
                  <option value="comptant">Comptant (sans crédit)</option>
                </select>
                <p className="mt-1.5 text-xs text-white/45">
                  Hypothèses de financement : apport 20 %, taux 3,8 % sur 20 ans
                  (sauf comptant / in fine).
                </p>
              </div>

              {error ? (
                <p
                  className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-100"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={close}
                  className="h-11 rounded-xl border border-white/10 px-5 text-sm font-semibold text-white/85 transition hover:bg-white/[0.06]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="h-11 rounded-xl bg-emerald-500/90 px-6 text-sm font-semibold text-stone-950 transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  {pending ? "Enregistrement…" : "Enregistrer le bien"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
