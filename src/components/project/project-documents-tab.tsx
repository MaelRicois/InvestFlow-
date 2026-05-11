"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, FileUp, Loader2, Trash2 } from "lucide-react";
import { useClerkSupabase } from "@/lib/supabase/clerk-browser";
import {
  DOCUMENT_CATEGORY_META,
  DOCUMENT_CATEGORY_ORDER,
  type DocumentCategory,
  PROJECT_DOCUMENTS_BUCKET,
} from "@/lib/project/document-categories";

export type PropertyDocumentRow = {
  id: string;
  property_id: number;
  category: DocumentCategory;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

const MAX_BYTES = 15 * 1024 * 1024;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function safeFileSegment(name: string) {
  const base = name.replace(/^.*[/\\]/, "").replace(/[^a-zA-Z0-9._-]/g, "_");
  return (base || "fichier").slice(0, 120);
}

function formatBytes(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatShortDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type Props = {
  propertyId: number;
  initialDocuments: PropertyDocumentRow[];
};

export function ProjectDocumentsTab({
  propertyId,
  initialDocuments,
}: Props) {
  const { userId } = useAuth();
  const supabase = useClerkSupabase();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] =
    useState<PropertyDocumentRow[]>(initialDocuments);
  const [uploadCategory, setUploadCategory] =
    useState<DocumentCategory>("achat");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  const loadDocuments = useCallback(async () => {
    const { data, error: qErr } = await supabase
      .from("property_documents")
      .select(
        "id, property_id, category, storage_path, file_name, mime_type, size_bytes, created_at"
      )
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false });
    if (qErr) return;
    const rows = (data ?? []) as PropertyDocumentRow[];
    setDocuments(rows);
  }, [supabase, propertyId]);

  async function uploadFiles(files: FileList | File[]) {
    if (!userId) {
      setError("Vous devez être connecté pour envoyer des fichiers.");
      return;
    }
    const list = Array.from(files);
    if (list.length === 0) return;

    setError(null);
    setUploading(true);
    try {
      for (const file of list) {
        if (file.size > MAX_BYTES) {
          setError(`« ${file.name} » dépasse la limite de 15 Mo.`);
          continue;
        }
        const segment = `${crypto.randomUUID()}_${safeFileSegment(file.name)}`;
        const path = `${userId}/${propertyId}/${uploadCategory}/${segment}`;

        const { error: upErr } = await supabase.storage
          .from(PROJECT_DOCUMENTS_BUCKET)
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "application/octet-stream",
          });
        if (upErr) {
          setError(upErr.message);
          continue;
        }

        const { error: insErr } = await supabase.from("property_documents").insert({
          property_id: propertyId,
          user_id: userId,
          category: uploadCategory,
          storage_path: path,
          file_name: file.name,
          mime_type: file.type || null,
          size_bytes: file.size,
        });
        if (insErr) {
          await supabase.storage.from(PROJECT_DOCUMENTS_BUCKET).remove([path]);
          setError(insErr.message);
          continue;
        }
      }
      await loadDocuments();
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files);
  }

  async function handleOpenFile(doc: PropertyDocumentRow) {
    setPreviewingId(doc.id);
    setError(null);
    try {
      const { data, error: uErr } = await supabase.storage
        .from(PROJECT_DOCUMENTS_BUCKET)
        .createSignedUrl(doc.storage_path, 3600);
      if (uErr || !data?.signedUrl) {
        setError(
          uErr?.message ?? "Impossible de générer le lien sécurisé pour ce fichier."
        );
        return;
      }
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } finally {
      setPreviewingId(null);
    }
  }

  async function handleDelete(doc: PropertyDocumentRow) {
    if (!window.confirm(`Supprimer « ${doc.file_name} » ?`)) return;
    setDeletingId(doc.id);
    setError(null);
    try {
      const { error: dbErr } = await supabase
        .from("property_documents")
        .delete()
        .eq("id", doc.id);
      if (dbErr) {
        setError(dbErr.message);
        return;
      }
      const { error: stErr } = await supabase.storage
        .from(PROJECT_DOCUMENTS_BUCKET)
        .remove([doc.storage_path]);
      if (stErr) {
        setError(
          `Fichier retiré de la liste ; le stockage a signalé : ${stErr.message}`
        );
      }
      await loadDocuments();
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  const byCategory = DOCUMENT_CATEGORY_ORDER.map((cat) => ({
    category: cat,
    meta: DOCUMENT_CATEGORY_META[cat],
    items: documents.filter((d) => d.category === cat),
  }));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-lg font-semibold text-stone-900">
          Déposer des documents
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Choisissez la catégorie, puis glissez-déposez vos fichiers (max. 15 Mo
          chacun). PDF, images et fichiers Office courants.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {DOCUMENT_CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setUploadCategory(cat)}
              className={cx(
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                uploadCategory === cat
                  ? "border-amber-600 bg-amber-50 text-amber-950"
                  : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
              )}
            >
              {DOCUMENT_CATEGORY_META[cat].label}
              <span className="ml-1.5 font-normal text-stone-500">
                ({DOCUMENT_CATEGORY_META[cat].hint})
              </span>
            </button>
          ))}
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx,application/pdf,image/*"
          onChange={(e) => {
            if (e.target.files?.length) void uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          disabled={uploading}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (e.currentTarget === e.target) setDragOver(false);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cx(
            "mt-4 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition",
            dragOver
              ? "border-amber-500 bg-amber-50/60"
              : "border-stone-300 bg-stone-50/80 hover:border-amber-400/80 hover:bg-amber-50/30",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          {uploading ? (
            <Loader2 className="size-10 animate-spin text-amber-700" aria-hidden />
          ) : (
            <FileUp className="size-10 text-stone-400" aria-hidden />
          )}
          <p className="mt-3 text-sm font-semibold text-stone-800">
            {uploading
              ? "Envoi en cours…"
              : "Glissez-déposez vos fichiers ici ou cliquez pour parcourir"}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Catégorie active :{" "}
            <span className="font-semibold text-stone-700">
              {DOCUMENT_CATEGORY_META[uploadCategory].label}
            </span>
          </p>
        </button>
      </section>

      {error ? (
        <p
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <section className="space-y-6">
        <h2 className="font-display text-lg font-semibold text-stone-900">
          Documents par catégorie
        </h2>
        {byCategory.map(({ category, meta, items }) => (
          <div
            key={category}
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
          >
            <div className="border-b border-stone-100 bg-stone-50 px-4 py-3 sm:px-5">
              <h3 className="font-semibold text-stone-900">{meta.label}</h3>
              <p className="text-xs text-stone-500">{meta.hint}</p>
            </div>
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-stone-500 sm:px-5">
                Aucun document dans cette catégorie.
              </p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {items.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-900">
                        {doc.file_name}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {formatShortDate(doc.created_at)} ·{" "}
                        {formatBytes(doc.size_bytes)}
                        {doc.mime_type ? ` · ${doc.mime_type}` : null}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void handleOpenFile(doc)}
                        disabled={previewingId === doc.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-800 transition hover:bg-stone-50 disabled:opacity-50"
                      >
                        {previewingId === doc.id ? (
                          <Loader2 className="size-3.5 animate-spin" aria-hidden />
                        ) : (
                          <Eye className="size-3.5" aria-hidden />
                        )}
                        Prévisualiser / ouvrir
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(doc)}
                        disabled={deletingId === doc.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                      >
                        {deletingId === doc.id ? (
                          <Loader2 className="size-3.5 animate-spin" aria-hidden />
                        ) : (
                          <Trash2 className="size-3.5" aria-hidden />
                        )}
                        Supprimer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
