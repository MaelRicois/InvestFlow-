"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { CalculateurPageContent } from "@/components/calculateur/calculateur-page-content";
import {
  ProjectSuiviTab,
  type TransactionRow,
} from "@/components/project/project-suivi-tab";
import {
  ProjectDocumentsTab,
  type PropertyDocumentRow,
} from "@/components/project/project-documents-tab";
import type { PatrimoineSnapshot } from "@/lib/property/patrimoine-snapshot";
import type { DashboardPropertyRow } from "@/lib/dashboard/types";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type TabId = "analyse" | "suivi" | "documents";

type Props = {
  property: DashboardPropertyRow;
  transactions: TransactionRow[];
  chartLabels: string[];
  chartValues: number[];
  patrimoine: PatrimoineSnapshot;
  documents: PropertyDocumentRow[];
};

export function ProjectDetailTabs({
  property,
  transactions,
  chartLabels,
  chartValues,
  patrimoine,
  documents,
}: Props) {
  const [tab, setTab] = useState<TabId>("analyse");
  const name = property.name?.trim() || "Projet";

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-800/90">
            Projet #{property.id}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            {name}
          </h1>
          {property.city ? (
            <p className="mt-1 text-sm text-stone-600">{property.city}</p>
          ) : null}
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-amber-900 underline-offset-4 hover:underline"
        >
          ← Retour au dashboard
        </Link>
      </div>

      <div
        className="mt-6 flex flex-wrap gap-1 rounded-xl border border-stone-200 bg-stone-100/80 p-1 sm:inline-flex"
        role="tablist"
        aria-label="Sections du projet"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "analyse"}
          onClick={() => setTab("analyse")}
          className={cx(
            "rounded-lg px-4 py-2.5 text-sm font-semibold transition",
            tab === "analyse"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-600 hover:text-stone-900"
          )}
        >
          Analyse
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "suivi"}
          onClick={() => setTab("suivi")}
          className={cx(
            "rounded-lg px-4 py-2.5 text-sm font-semibold transition",
            tab === "suivi"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-600 hover:text-stone-900"
          )}
        >
          Suivi financier
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "documents"}
          onClick={() => setTab("documents")}
          className={cx(
            "rounded-lg px-4 py-2.5 text-sm font-semibold transition",
            tab === "documents"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-600 hover:text-stone-900"
          )}
        >
          Documents
        </button>
      </div>

      <div className="mt-8" role="tabpanel">
        {tab === "analyse" ? (
          <div>
            <p className="mb-4 text-sm text-stone-600">
              Données théoriques (calculateur). Les modifications peuvent être
              enregistrées vers Supabase comme sur la page calculateur.
            </p>
            <Suspense
              fallback={
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-12 text-center text-sm text-stone-600">
                  Chargement du calculateur…
                </div>
              }
            >
              <CalculateurPageContent
                embedded
                embedPropertyId={property.id}
              />
            </Suspense>
          </div>
        ) : tab === "suivi" ? (
          <ProjectSuiviTab
            propertyId={property.id}
            transactions={transactions}
            chartLabels={chartLabels}
            chartValues={chartValues}
            patrimoine={patrimoine}
          />
        ) : (
          <ProjectDocumentsTab
            propertyId={property.id}
            initialDocuments={documents}
          />
        )}
      </div>
    </div>
  );
}
