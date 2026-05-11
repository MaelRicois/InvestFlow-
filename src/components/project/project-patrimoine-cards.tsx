import type { PatrimoineSnapshot } from "@/lib/property/patrimoine-snapshot";

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
    maximumFractionDigits: 1,
  }).format(value / 100);
}

type Props = {
  snapshot: PatrimoineSnapshot;
};

export function ProjectPatrimoineCards({ snapshot }: Props) {
  return (
    <section
      className="rounded-2xl border border-stone-200 bg-stone-50/80 p-6 shadow-sm"
      aria-labelledby="patrimoine-heading"
    >
      <h2
        id="patrimoine-heading"
        className="font-display text-lg font-semibold tracking-tight text-stone-900"
      >
        Vue patrimoine
      </h2>
      <p className="mt-1 text-sm text-stone-600">
        Estimation à partir du coût total projet (+3 %), crédit amortissable
        (hypothèses 20 % d&apos;apport, 3,8 % sur 20 ans, depuis la date de
        création du projet).
      </p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Valeur estimée du bien
          </dt>
          <dd className="mt-2 text-xl font-semibold tabular-nums text-stone-900">
            {formatEUR(snapshot.valeurEstimee)}
          </dd>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Capital restant dû
          </dt>
          <dd className="mt-2 text-xl font-semibold tabular-nums text-stone-900">
            {formatEUR(snapshot.capitalRestantDu)}
          </dd>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Capital déjà remboursé
          </dt>
          <dd className="mt-2 text-xl font-semibold tabular-nums text-emerald-700">
            {formatEUR(snapshot.capitalRembourse)}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-stone-600">
        <span className="font-semibold text-stone-800">LTV (encours / valeur)</span>{" "}
        :{" "}
        <span className="font-semibold tabular-nums text-stone-900">
          {formatPct(snapshot.ltvEncoursPct)}
        </span>{" "}
        — après environ {snapshot.moisEcoules} mois depuis l&apos;enregistrement du
        projet.
      </p>
    </section>
  );
}
