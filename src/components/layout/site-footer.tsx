import { Building2 } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-stone-700">
          <Building2 className="size-5 text-stone-400" strokeWidth={1.5} aria-hidden />
          <span className="text-sm font-medium">InvestFlow</span>
          <span className="text-sm text-stone-500">
            — Pilotage immobilier, sans friction.
          </span>
        </div>
        <p className="text-sm text-stone-500">
          © {new Date().getFullYear()} InvestFlow. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
