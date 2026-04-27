import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Calculator,
  Camera,
  FileSpreadsheet,
  Gem,
  MapPin,
  Save,
  TrendingUp,
  Sparkles,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Scraping intelligent",
    description:
      "On récupère les annonces de SeLoger et Leboncoin pour vous.",
  },
  {
    icon: Zap,
    title: "Analyse instantanée",
    description:
      "Calcul du cash-flow, rendement net et fiscalité en un clic.",
  },
  {
    icon: Gem,
    title: "Gestion de patrimoine",
    description:
      "Sauvegardez vos pépites et comparez-les facilement.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-sky-950/40 via-stone-950 to-stone-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 25%, rgba(56, 189, 248, 0.16), transparent 45%), radial-gradient(circle at 70% 15%, rgba(168, 85, 247, 0.14), transparent 42%), radial-gradient(circle at 50% 80%, rgba(34, 197, 94, 0.10), transparent 45%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(115deg, rgba(34,211,238,0.16), rgba(12,10,9,0) 45%, rgba(12,10,9,0.85))",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(12, 10, 9, 0), rgba(12, 10, 9, 0.85))",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/75 backdrop-blur">
                <span className="inline-flex size-2 rounded-full bg-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.15)]" />
                InvestFlow — SaaS d’investissement immobilier
              </p>
              <h1 className="font-display mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl sm:leading-tight lg:mx-0">
                Prenez des décisions immo basées sur des chiffres, pas sur du
                flair.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70 lg:mx-0">
                Le premier outil qui calcule votre fiscalité réelle (LMNP, SCI,
                Nu) dès la première visite. Gagnez du temps, évitez les erreurs.
              </p>
              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:items-start">
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Link
                      href="/sign-up"
                      className="group inline-flex w-full min-w-[260px] items-center justify-center gap-2 rounded-full bg-white px-10 py-4 text-sm font-semibold text-stone-950 shadow-[0_14px_40px_-18px_rgba(0,0,0,0.65)] transition hover:bg-white/95 hover:shadow-[0_0_0_4px_rgba(34,211,238,0.14),0_18px_60px_-22px_rgba(34,211,238,0.45)] sm:w-auto"
                    >
                      S’inscrire
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                    <span className="text-xs font-medium text-white/70">
                      Sans carte bancaire
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white/75">
                    Déjà 250+ simulations effectuées cette semaine
                  </p>
                </div>

                <Link
                  href="/calculateur"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10 sm:w-auto"
                >
                  <Calculator className="size-4" aria-hidden />
                  Calculateur gratuit
                </Link>
              </div>

              <div className="mt-14 grid gap-4 sm:grid-cols-3 lg:pr-10">
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                    Temps réel
                  </p>
                  <p className="mt-2 text-sm text-white/75">
                    Filtrez une ville, scrollez, ouvrez le calculateur.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                    Décision
                  </p>
                  <p className="mt-2 text-sm text-white/75">
                    Rendement net estimé, charges et taxe foncière.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                    Simplicité
                  </p>
                  <p className="mt-2 text-sm text-white/75">
                    Moins d’Excel, plus d’opportunités qualifiées.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="animate-float w-full max-w-md">
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
                  <span className="pointer-events-none absolute -left-16 -top-16 size-40 rounded-full bg-emerald-400/20 blur-2xl" />
                  <span className="pointer-events-none absolute -bottom-16 -right-16 size-44 rounded-full bg-sky-400/20 blur-2xl" />

                  <div className="relative">
                    <div className="absolute right-4 top-4 z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        <TrendingUp className="size-3.5" aria-hidden />
                        8.5% Yield/Rendement
                      </span>
                    </div>

                    <div className="aspect-[16/10] w-full overflow-hidden bg-stone-100">
                      <Image
                        src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80"
                        alt="Appartement lumineux"
                        className="h-full w-full object-cover"
                        width={1200}
                        height={750}
                        priority={false}
                      />
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
                          <MapPin className="size-4 text-stone-500" aria-hidden />
                          Bordeaux Centre-Ville
                        </p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                          150&nbsp;000&nbsp;€
                        </p>
                        <p className="mt-1 text-sm text-stone-600">
                          45m², 3 pièces
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Link
                        href="/calculateur"
                        className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(16,185,129,0.65)] transition hover:brightness-105"
                      >
                        <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <span className="absolute -left-1/3 top-0 h-full w-1/3 rotate-12 bg-white/25 blur-md" />
                        </span>
                        Calculer Cash-Flow
                        <ArrowRight className="size-4" aria-hidden />
                      </Link>
                      <p className="mt-3 text-center text-xs text-stone-500">
                        Exemple d’annonce détectée automatiquement
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-stone-900">
              Comment ça marche
            </h2>
            <p className="mt-3 text-stone-600">
              3 étapes simples pour décider plus vite, avec les bons chiffres.
            </p>
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-3">
            <li className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <span className="flex size-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                <Camera className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold text-stone-900">
                Scannez une annonce
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Importez le lien (ou les infos) et récupérez automatiquement les
                données utiles.
              </p>
            </li>
            <li className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <span className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <Calculator className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold text-stone-900">
                Calculez le Net-Net
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Cash-flow, charges, fiscalité réelle (LMNP/SCI/Nu) et
                rentabilité nette.
              </p>
            </li>
            <li className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <span className="flex size-12 items-center justify-center rounded-xl bg-stone-900 text-white">
                <Save className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold text-stone-900">
                Sauvegardez sur votre Dashboard
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Gardez vos simulations, comparez, et revenez dessus en 1 clic.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section
        id="fonctionnalites"
        className="scroll-mt-20 border-b border-stone-200 bg-white py-20 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-stone-900">
              Fonctionnalités
            </h2>
            <p className="mt-3 text-stone-600">
              Tout ce qu’il faut pour passer de “je regarde” à “j’investis” sans
              perdre de temps.
            </p>
          </div>
          <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <li
                key={title}
                className="rounded-2xl border border-stone-200 bg-white/70 p-6 shadow-sm backdrop-blur transition-shadow hover:shadow-md"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-stone-900 text-white">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold text-stone-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="pourquoi"
        className="scroll-mt-20 bg-stone-50 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div className="pt-2">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-stone-900">
                Pourquoi nous ?
              </h2>
              <p className="mt-4 text-stone-600 leading-relaxed">
                Un comparatif simple. L’objectif : réduire le temps “analyse” et
                augmenter le temps “action”.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/discover"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800"
                >
                  Tester la recherche
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href="/calculateur"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-stone-400"
                >
                  <Calculator className="size-4" aria-hidden />
                  Ouvrir le calculateur
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-stone-200 bg-white/70 p-5">
                  <div className="flex items-center gap-2 text-stone-800">
                    <FileSpreadsheet className="size-4 text-stone-500" aria-hidden />
                    <p className="text-sm font-semibold">Excel</p>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-stone-600">
                    <li className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-stone-300" />
                      Lent à mettre à jour
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-stone-300" />
                      Erreurs de saisie
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-stone-300" />
                      Tout est manuel
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-stone-900/10 bg-stone-950 p-5 text-white shadow-[0_18px_40px_-24px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center gap-2">
                    <Gem className="size-4 text-sky-300" aria-hidden />
                    <p className="text-sm font-semibold">InvestFlow</p>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-white/75">
                    <li className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky-300/80" />
                      Rapide (scan + filtre)
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky-300/80" />
                      Précis (règles cohérentes)
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky-300/80" />
                      Automatisé (rendement net)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-stone-200 bg-gradient-to-r from-stone-950 to-stone-900 px-6 py-10 text-white shadow-sm sm:px-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  Prêt à démarrer ?
                </p>
                <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Lancez une recherche et gardez les meilleures annonces.
                </h2>
                <p className="mt-3 text-sm text-white/70">
                  Le reste (calcul, tri, comparaison) s’enchaîne tout seul.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/discover"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-stone-950 transition hover:bg-white/90"
                >
                  Lancer une recherche
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href="/calculateur"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
                >
                  <Calculator className="size-4" aria-hidden />
                  Calculateur gratuit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
