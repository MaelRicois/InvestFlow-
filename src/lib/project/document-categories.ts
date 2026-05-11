export type DocumentCategory = "achat" | "technique" | "gestion";

export const DOCUMENT_CATEGORY_ORDER: DocumentCategory[] = [
  "achat",
  "technique",
  "gestion",
];

export const DOCUMENT_CATEGORY_META: Record<
  DocumentCategory,
  { label: string; hint: string }
> = {
  achat: { label: "Achat", hint: "Compromis, Acte" },
  technique: { label: "Technique", hint: "DPE, Plans" },
  gestion: { label: "Gestion", hint: "Baux, Quittances" },
};

export const PROJECT_DOCUMENTS_BUCKET = "project-documents" as const;
