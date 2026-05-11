import { Suspense } from "react";
import { CalculateurPageContent } from "@/components/calculateur/calculateur-page-content";

export default function CalculateurPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 bg-stone-50">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm text-stone-600">Chargement du calculateur…</p>
          </div>
        </main>
      }
    >
      <CalculateurPageContent />
    </Suspense>
  );
}
