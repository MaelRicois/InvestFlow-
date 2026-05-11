import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { ProjectDetailTabs } from "@/components/project/project-detail-tabs";
import type { PropertyDocumentRow } from "@/components/project/project-documents-tab";
import type { DashboardPropertyRow } from "@/lib/dashboard/types";
import type { DocumentCategory } from "@/lib/project/document-categories";
import {
  fillMonthlyTotalsFromTransactions,
  lastSixCalendarMonths,
} from "@/lib/property/cashflow-series";
import { computePatrimoineSnapshot } from "@/lib/property/patrimoine-snapshot";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Projet ${id} — InvestFlow`,
    description: "Analyse théorique et suivi financier de votre projet immobilier.",
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0 || !Number.isInteger(id)) {
    notFound();
  }

  const { userId } = await auth();
  if (!userId) {
    return (
      <main className="flex-1 bg-stone-50">
        <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
          <h1 className="font-display text-2xl font-semibold text-stone-900">
            Connexion requise
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Connectez-vous pour consulter le détail de ce projet.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-stone-900 px-6 text-sm font-semibold text-amber-50 transition hover:bg-stone-800"
          >
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !row) {
    notFound();
  }

  const { data: txnData, error: txnError } = await supabase
    .from("property_transactions")
    .select("id, occurred_on, label, amount, category")
    .eq("property_id", id)
    .order("occurred_on", { ascending: false });

  const transactions = (txnError ? [] : (txnData ?? [])).map((t) => ({
    id: Number(t.id),
    occurred_on: String(t.occurred_on),
    label: String(t.label),
    amount: Number(t.amount),
    category: t.category != null ? String(t.category) : null,
  }));

  const base = lastSixCalendarMonths();
  const filled = fillMonthlyTotalsFromTransactions(
    base,
    transactions.map((t) => ({
      occurred_on: t.occurred_on,
      amount: t.amount,
    }))
  );
  const chartLabels = filled.map((p) => p.label);
  const chartValues = filled.map((p) => p.value);

  const rowObj = row as Record<string, unknown>;
  const { user_id, ...rest } = rowObj;
  void user_id;
  const property = rest as DashboardPropertyRow;

  const patrimoine = computePatrimoineSnapshot({
    total_project_cost: row.total_project_cost as number | string | null,
    created_at:
      typeof row.created_at === "string" ? row.created_at : null,
  });

  const { data: docData, error: docErr } = await supabase
    .from("property_documents")
    .select(
      "id, property_id, category, storage_path, file_name, mime_type, size_bytes, created_at"
    )
    .eq("property_id", id)
    .order("created_at", { ascending: false });

  const documents: PropertyDocumentRow[] = (docErr ? [] : (docData ?? [])).map(
    (d) => ({
      id: String((d as { id: unknown }).id),
      property_id: Number((d as { property_id: unknown }).property_id),
      category: String((d as { category: unknown }).category) as DocumentCategory,
      storage_path: String((d as { storage_path: unknown }).storage_path),
      file_name: String((d as { file_name: unknown }).file_name),
      mime_type:
        (d as { mime_type: unknown }).mime_type != null
          ? String((d as { mime_type: unknown }).mime_type)
          : null,
      size_bytes:
        (d as { size_bytes: unknown }).size_bytes != null
          ? Number((d as { size_bytes: unknown }).size_bytes)
          : null,
      created_at: String((d as { created_at: unknown }).created_at),
    })
  );

  return (
    <main className="flex-1 bg-stone-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <ProjectDetailTabs
          property={property}
          transactions={transactions}
          chartLabels={chartLabels}
          chartValues={chartValues}
          patrimoine={patrimoine}
          documents={documents}
        />
      </div>
    </main>
  );
}
