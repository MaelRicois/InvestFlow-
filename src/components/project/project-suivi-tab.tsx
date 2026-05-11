"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CashflowNetLineChart } from "@/components/project/cashflow-net-line-chart";
import { ProjectPatrimoineCards } from "@/components/project/project-patrimoine-cards";
import type { PatrimoineSnapshot } from "@/lib/property/patrimoine-snapshot";

export type TransactionRow = {
  id: number;
  occurred_on: string;
  label: string;
  amount: number;
  category: string | null;
};

type Props = {
  propertyId: number;
  transactions: TransactionRow[];
  chartLabels: string[];
  chartValues: number[];
  patrimoine: PatrimoineSnapshot;
};

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso + "T12:00:00"));
  } catch {
    return iso;
  }
}

export function ProjectSuiviTab({
  propertyId,
  transactions,
  chartLabels,
  chartValues,
  patrimoine,
}: Props) {
  const router = useRouter();
  const [occurredOn, setOccurredOn] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/transactions`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            occurred_on: occurredOn,
            label: label.trim(),
            amount: Number(String(amount).replace(",", ".")),
            category: category.trim() || null,
          }),
        }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? `Erreur ${res.status}`);
        return;
      }
      setLabel("");
      setAmount("");
      setCategory("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-10">
      <ProjectPatrimoineCards snapshot={patrimoine} />

      <CashflowNetLineChart
        uid={`cf-${propertyId}`}
        labels={chartLabels}
        values={chartValues}
      />

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-stone-900">
          Transactions réelles
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Loyers, charges, travaux : utilisez des montants positifs pour les
          entrées et négatifs pour les sorties.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid gap-4 rounded-xl border border-stone-100 bg-stone-50/80 p-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end"
        >
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
              Date
            </label>
            <input
              type="date"
              required
              value={occurredOn}
              onChange={(e) => setOccurredOn(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div className="lg:col-span-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
              Libellé
            </label>
            <input
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Loyer novembre"
              className="mt-1.5 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
              Montant (€)
            </label>
            <input
              required
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1200 ou -450"
              className="mt-1.5 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm tabular-nums text-stone-900 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
              Catégorie (optionnel)
            </label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Loyer"
              className="mt-1.5 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="h-11 w-full rounded-lg bg-stone-900 px-4 text-sm font-semibold text-amber-50 transition hover:bg-stone-800 disabled:opacity-50"
            >
              {pending ? "Enregistrement…" : "Ajouter"}
            </button>
          </div>
        </form>

        {error ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 overflow-x-auto rounded-xl border border-stone-200">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50">
              <tr className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Libellé</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {transactions.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-10 text-center text-stone-500"
                    colSpan={4}
                  >
                    Aucune transaction. Ajoutez votre premier mouvement ci-dessus.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="bg-white">
                    <td className="whitespace-nowrap px-4 py-3 text-stone-700">
                      {formatDate(t.occurred_on)}
                    </td>
                    <td className="px-4 py-3 font-medium text-stone-900">
                      {t.label}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {t.category ?? "—"}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold tabular-nums ${
                        t.amount >= 0 ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {formatEUR(t.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
