"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useClerkSupabase } from "@/lib/supabase/clerk-browser";
import {
  Banknote,
  Calculator,
  CreditCard,
  FileDown,
  Home,
  Percent,
  TrendingUp,
} from "lucide-react";
import {
  generateBankReportPdfBlob,
  type BankReportData,
} from "@/components/pdf/BankReport";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";

function LegendItem({
  colorClass,
  label,
}: {
  colorClass: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-2.5 rounded-full ${colorClass}`} aria-hidden />
      <span className="font-medium tabular-nums">{label}</span>
    </div>
  );
}

function parseNumber(value: string) {
  const cleaned = value.replace(/\s/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function toInputNumberString(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return String(Math.round(n));
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

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
    maximumFractionDigits: 2,
  }).format(value / 100);
}

function monthlyPayment({
  principal,
  annualRatePct,
  years,
}: {
  principal: number;
  annualRatePct: number;
  years: number;
}) {
  const n = Math.round(years * 12);
  if (!Number.isFinite(principal) || principal === 0) return 0;
  if (!Number.isFinite(n) || n <= 0) return 0;

  const r = (annualRatePct / 100) / 12;
  if (!Number.isFinite(r) || r < 0) return 0;

  // Formule standard des intérêts composés:
  // M = P * r / (1 - (1+r)^(-n)) ; si r=0 => M = P / n
  if (r === 0) return principal / n;
  const denom = 1 - Math.pow(1 + r, -n);
  if (denom === 0) return 0;
  return (principal * r) / denom;
}

function CalculateurPageContent() {
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const supabase = useClerkSupabase();
  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(
    null
  );

  const [listingText, setListingText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const [projectName, setProjectName] = useState("Immeuble Libourne");

  const [purchaseNetSeller, setPurchaseNetSeller] = useState("200000");
  const [worksBudget, setWorksBudget] = useState("25000");
  const [notaryAuto, setNotaryAuto] = useState(true);
  const [notaryFeesManual, setNotaryFeesManual] = useState("");

  const [downPayment, setDownPayment] = useState("20000");
  const [interestRatePct, setInterestRatePct] = useState("3.8");
  const [durationYears, setDurationYears] = useState("20");

  const [monthlyRent, setMonthlyRent] = useState("1200");
  const [monthlyPropertyTax, setMonthlyPropertyTax] = useState("110");
  const [monthlyChargesInsurance, setMonthlyChargesInsurance] = useState("160");

  const [taxRegime, setTaxRegime] = useState<
    "micro_foncier" | "reel_nu" | "lmnp_amort" | "sci_is"
  >("reel_nu");
  const [tmiPct, setTmiPct] = useState<0 | 11 | 30 | 41 | 45>(30);

  const [isSaving, setIsSaving] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const lastHydratedQueryRef = useRef<string | null>(null);

  async function handleAnalyzeListing() {
    const text = listingText.trim();
    if (!text) return;

    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = (await res.json()) as
        | {
            error?: string;
            name?: unknown;
            purchase_price?: unknown;
            renovation_cost?: unknown;
            monthly_rent?: unknown;
            tax_monthly?: unknown;
            charges_monthly?: unknown;
          }
        | unknown;

      if (!res.ok) {
        const err =
          typeof data === "object" && data != null && "error" in data
            ? String((data as { error?: unknown }).error ?? "Erreur inconnue")
            : `Erreur API (${res.status})`;
        setAnalyzeError(err);
        return;
      }

      const obj = data as Record<string, unknown>;

      if (typeof obj.name === "string" && obj.name.trim()) {
        setProjectName(obj.name.trim());
      }

      const purchase = toInputNumberString(obj.purchase_price);
      if (purchase != null) setPurchaseNetSeller(purchase);

      const works = toInputNumberString(obj.renovation_cost);
      if (works != null) setWorksBudget(works);

      const rent = toInputNumberString(obj.monthly_rent);
      if (rent != null) setMonthlyRent(rent);

      const tax = toInputNumberString(obj.tax_monthly);
      if (tax != null) setMonthlyPropertyTax(tax);

      const charges = toInputNumberString(obj.charges_monthly);
      if (charges != null) setMonthlyChargesInsurance(charges);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur inconnue";
      setAnalyzeError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  useEffect(() => {
    const qs = searchParams.toString();
    const raw = searchParams.get("propertyId");
    if (lastHydratedQueryRef.current === qs) return;
    lastHydratedQueryRef.current = qs;

    const id =
      raw == null || raw === ""
        ? null
        : (() => {
            const n = Number(raw);
            return Number.isFinite(n) && n > 0 && Number.isInteger(n) ? n : null;
          })();
    setEditingPropertyId(id);

    // Hydratation depuis query params, même sans propertyId (ex: /calculator → /calculateur)
    const name = searchParams.get("name");
    if (name != null && name !== "") setProjectName(name);

    const purchase = searchParams.get("purchase_price");
    if (purchase != null && purchase !== "") setPurchaseNetSeller(purchase);

    const works = searchParams.get("works_budget");
    if (works != null && works !== "") setWorksBudget(works);

    const rent = searchParams.get("monthly_rent");
    if (rent != null && rent !== "") setMonthlyRent(rent);

    const tax = searchParams.get("tax_monthly");
    if (tax != null && tax !== "") setMonthlyPropertyTax(tax);

    const charges = searchParams.get("charges_monthly");
    if (charges != null && charges !== "")
      setMonthlyChargesInsurance(charges);
  }, [searchParams]);

  const numbers = useMemo(() => {
    const achatPrix = parseNumber(purchaseNetSeller);
    const travaux = parseNumber(worksBudget);

    // 1) ACHAT
    const fraisNotaire = notaryAuto
      ? achatPrix * 0.08
      : Math.max(0, parseNumber(notaryFeesManual));
    const coutTotalProjet = achatPrix + travaux + fraisNotaire;

    // 2) CRÉDIT
    const apport = parseNumber(downPayment);
    const taux = parseNumber(interestRatePct);
    const duree = parseNumber(durationYears);
    const montantAEmprunter = coutTotalProjet - apport;
    const mensualite = monthlyPayment({
      principal: montantAEmprunter,
      annualRatePct: taux,
      years: duree,
    });
    const interetsMensuelsEstimes =
      montantAEmprunter <= 0 || taux <= 0
        ? 0
        : (montantAEmprunter * (taux / 100)) / 12;

    // 3) EXPLOITATION
    const loyer = parseNumber(monthlyRent);
    const taxe = parseNumber(monthlyPropertyTax);
    const charges = parseNumber(monthlyChargesInsurance);
    const vacanceLocative = loyer * 0.05;

    // 4) BILAN
    const cashflowMensuel = loyer - vacanceLocative - taxe - charges - mensualite;
    const loyerMensuelNetDeCharges = loyer - vacanceLocative - taxe - charges;
    const loyerAnnuelNetDeCharges = loyerMensuelNetDeCharges * 12;
    const rendementNet =
      coutTotalProjet === 0 ? 0 : (loyerAnnuelNetDeCharges / coutTotalProjet) * 100;

    // 5) FISCALITÉ (estimation)
    const tmiRate = tmiPct / 100;
    const psRate = 0.172;
    const nuRate = tmiRate + psRate;
    const chargesTotal = vacanceLocative + taxe + charges;
    const baseNuReel = loyer - chargesTotal - interetsMensuelsEstimes;
    const impotsNuReel = Math.max(0, baseNuReel * nuRate);

    const amortMensuel = (achatPrix * 0.03) / 12;
    const baseLmnp = loyer - chargesTotal - interetsMensuelsEstimes - amortMensuel;
    const impotsLmnp = Math.max(0, baseLmnp * nuRate);

    // Micro-foncier (approx standard) : abattement 30% sur loyers, pas de déduction charges.
    const impotsMicro = Math.max(0, loyer * 0.7 * nuRate);

    // SCI à l'IS (approx) : taux unique 25% sur résultat (avec amort estimé).
    const baseSciIs = loyer - chargesTotal - interetsMensuelsEstimes - amortMensuel;
    const impotsSciIs = Math.max(0, baseSciIs * 0.25);

    const impotsMensuels =
      taxRegime === "micro_foncier"
        ? impotsMicro
        : taxRegime === "reel_nu"
          ? impotsNuReel
          : taxRegime === "lmnp_amort"
            ? impotsLmnp
            : impotsSciIs;

    const cashflowNetNet = cashflowMensuel - impotsMensuels;

    return {
      achatPrix,
      travaux,
      fraisNotaire,
      coutTotalProjet,
      apport,
      taux,
      duree,
      montantAEmprunter,
      mensualite,
      interetsMensuelsEstimes,
      loyer,
      taxe,
      charges,
      vacanceLocative,
      cashflowMensuel,
      rendementNet,
      impotsMensuels,
      cashflowNetNet,
      impotsNuReel,
      impotsLmnp,
    };
  }, [
    purchaseNetSeller,
    worksBudget,
    notaryAuto,
    notaryFeesManual,
    downPayment,
    interestRatePct,
    durationYears,
    monthlyRent,
    monthlyPropertyTax,
    monthlyChargesInsurance,
    taxRegime,
    tmiPct,
  ]);

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);

    try {
      if (!userId) {
        setSaveError(
          "Vous devez être connecté pour sauvegarder. Connectez-vous puis réessayez."
        );
        return;
      }

      const payload = {
        user_id: userId,
        name: projectName.trim(),
        purchase_price: numbers.achatPrix,
        renovation_cost: numbers.travaux,
        notary_fees: numbers.fraisNotaire,
        total_project_cost: numbers.coutTotalProjet,
        monthly_rent: numbers.loyer,
        tax_monthly: numbers.taxe,
        charges_monthly: numbers.charges,
        vacancy_monthly: numbers.vacanceLocative,
        monthly_cashflow: numbers.cashflowMensuel,
        net_yield: numbers.rendementNet,
        credit_type: "amortissable",
      };

      const isUpdate = editingPropertyId != null;
      const { error } = isUpdate
        ? await supabase
            .from("properties")
            .update(payload)
            .eq("id", editingPropertyId)
        : await supabase.from("properties").insert(payload);
      if (error) {
        const code = (error as { code?: string }).code;

        if (code === "42P01") {
          setSaveError(
            "La table 'properties' n'existe pas encore dans Supabase.\n\n" +
              "À faire dans Supabase : Database → Table editor → New table\n" +
              "Nom : properties\n" +
              "Colonnes (types) :\n" +
              "- user_id (text)\n" +
              "- name (text)\n" +
              "- purchase_price (numeric)\n" +
              "- renovation_cost (numeric)\n" +
              "- notary_fees (numeric)\n" +
              "- total_project_cost (numeric)\n" +
              "- monthly_rent (numeric)\n" +
              "- tax_monthly (numeric)\n" +
              "- charges_monthly (numeric)\n" +
              "- vacancy_monthly (numeric)\n" +
              "- monthly_cashflow (numeric)\n" +
              "- net_yield (numeric)\n" +
              "- credit_type (text)\n\n" +
              "Puis réessaie de sauvegarder."
          );
          return;
        }

        if (code === "42703") {
          setSaveError(
            "La table 'properties' existe, mais il manque une ou plusieurs colonnes (ou elles ont un autre nom).\n\n" +
              "Vérifie dans Supabase → Database → Table editor → properties que tu as exactement :\n" +
              "name, purchase_price, renovation_cost, notary_fees, total_project_cost, monthly_rent, tax_monthly, charges_monthly, vacancy_monthly, monthly_cashflow, net_yield, credit_type, user_id\n\n" +
              "Détail Supabase : " +
              error.message
          );
          return;
        }

        setSaveError(`Erreur Supabase: ${error.message}`);
        return;
      }

      window.alert(
        isUpdate
          ? "✅ Projet mis à jour dans Supabase !"
          : "✅ Projet sauvegardé dans Supabase !"
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur inconnue";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGenerateBankPdf() {
    const name = projectName.trim();
    if (!name) return;

    setIsPdfGenerating(true);
    try {
      const chargesMensuelles =
        numbers.taxe + numbers.charges + numbers.vacanceLocative;

      const tauxLabel =
        new Intl.NumberFormat("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(numbers.taux) + " %";

      const dureeLabel =
        new Intl.NumberFormat("fr-FR", {
          maximumFractionDigits: 1,
        }).format(numbers.duree) + " ans";

      const generatedAtLabel = new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date());

      const data: BankReportData = {
        projectName: name,
        generatedAtLabel,
        synthese: {
          prixAchat: formatEUR(numbers.achatPrix),
          travaux: formatEUR(numbers.travaux),
          fraisNotaire: formatEUR(numbers.fraisNotaire),
          coutTotalProjet: formatEUR(numbers.coutTotalProjet),
        },
        financement: {
          apport: formatEUR(numbers.apport),
          montantEmprunt: formatEUR(numbers.montantAEmprunter),
          mensualite: formatEUR(numbers.mensualite),
          taux: tauxLabel,
          duree: dureeLabel,
        },
        performance: {
          loyer: formatEUR(numbers.loyer),
          charges: formatEUR(chargesMensuelles),
          cashflow: formatEUR(numbers.cashflowMensuel),
          rendementNet: formatPct(numbers.rendementNet),
        },
      };

      const blob = await generateBankReportPdfBlob(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeFileSlug = name
        .replace(/[/\\?%*:|"<>]/g, "-")
        .replace(/\s+/g, "-")
        .slice(0, 72);
      a.href = url;
      a.download = `dossier-bancaire-${safeFileSlug || "projet"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur inconnue";
      window.alert(`Impossible de générer le PDF : ${message}`);
    } finally {
      setIsPdfGenerating(false);
    }
  }

  const cashflowTone =
    numbers.cashflowMensuel > 0
      ? "text-emerald-600"
      : numbers.cashflowMensuel < 0
        ? "text-red-600"
        : "text-stone-700";

  return (
    <main className="flex-1 bg-stone-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-amber-800/90">
              Outil
            </p>
            <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight text-stone-900">
              Calculateur d’investissement
            </h1>
            <p className="mt-3 max-w-2xl text-stone-600">
              Renseigne tes hypothèses. Les cellules “calcul auto” reproduisent la logique
              de ton tableau : notaire 8%, vacance 5%, mensualité à intérêts composés,
              cash-flow et rendement net.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
            <Calculator className="size-5 text-amber-700" aria-hidden />
            <span className="text-sm font-medium text-stone-700">
              Tous les montants sont mensuels sauf indication
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <div className="grid gap-6 lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-stone-900">IA Chasseur d&apos;Annonces</CardTitle>
                <CardDescription>
                  Colle le texte de l’annonce (SeLoger, etc.) pour pré-remplir
                  automatiquement le calculateur.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Field label="Texte de l'annonce">
                    <Textarea
                      value={listingText}
                      onChange={(e) => setListingText(e.target.value)}
                      placeholder="Colle ici le texte complet de l’annonce…"
                    />
                  </Field>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={handleAnalyzeListing}
                      disabled={isAnalyzing || listingText.trim().length === 0}
                      className={cx(
                        "h-11 rounded-xl px-4 text-sm font-semibold shadow-sm transition-colors",
                        "bg-amber-600 text-white hover:bg-amber-700",
                        "disabled:cursor-not-allowed disabled:opacity-60"
                      )}
                    >
                      {isAnalyzing ? "Analyse en cours..." : "Analyser"}
                    </button>
                    <p className="text-xs text-stone-500">
                      L’API renvoie un JSON strict (clés Supabase).
                    </p>
                  </div>
                  {analyzeError ? (
                    <pre className="whitespace-pre-wrap rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                      {analyzeError}
                    </pre>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-stone-900">
                  <Calculator className="size-5 text-stone-500" aria-hidden />
                  Projet
                </CardTitle>
                <CardDescription>
                  Donne un nom à ce calcul pour pouvoir le retrouver.
                  {editingPropertyId != null ? (
                    <span className="mt-2 block font-medium text-amber-900/90">
                      Mode édition : les changements mettront à jour ce bien dans
                      Supabase.
                    </span>
                  ) : null}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
                  <Field label="Nom du projet" hint="Ex: Immeuble Libourne">
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Immeuble Libourne"
                    />
                  </Field>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || projectName.trim().length === 0}
                        className={cx(
                          "h-11 rounded-xl px-4 text-sm font-semibold shadow-sm transition-colors",
                          "bg-stone-900 text-amber-50 hover:bg-stone-800",
                          "disabled:cursor-not-allowed disabled:opacity-60",
                          "sm:min-w-0 sm:flex-1"
                        )}
                      >
                        {isSaving
                          ? "Sauvegarde..."
                          : editingPropertyId != null
                            ? "Mettre à jour"
                            : "Sauvegarder"}
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateBankPdf}
                        disabled={
                          isPdfGenerating || projectName.trim().length === 0
                        }
                        className={cx(
                          "inline-flex h-11 items-center justify-center gap-2 rounded-xl border-2 px-4 text-sm font-semibold transition-colors",
                          "border-[#1a365d] bg-white text-[#1a365d] hover:bg-slate-50",
                          "disabled:cursor-not-allowed disabled:opacity-60",
                          "sm:min-w-0 sm:flex-1"
                        )}
                      >
                        <FileDown className="size-4 shrink-0" aria-hidden />
                        {isPdfGenerating
                          ? "Génération..."
                          : "Générer le Dossier Bancaire"}
                      </button>
                    </div>
                    {saveError ? (
                      <pre className="whitespace-pre-wrap rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                        {saveError}
                      </pre>
                    ) : null}
                    <p className="text-xs text-stone-500">
                      Enregistre dans <span className="font-mono">properties</span> : nom,
                      prix d’achat, travaux, loyer, cash-flow et rendement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-stone-900">
                  <Home className="size-5 text-stone-500" aria-hidden />
                  ACHAT
                </CardTitle>
                <CardDescription>
                  Prix net vendeur + travaux. Active le calcul auto des notaires si tu ne connais pas le montant.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Prix d’achat Net Vendeur" right="€">
                    <Input
                      inputMode="decimal"
                      value={purchaseNetSeller}
                      onChange={(e) => setPurchaseNetSeller(e.target.value)}
                      placeholder="ex: 200000"
                    />
                  </Field>
                  <Field label="Budget Travaux" right="€">
                    <Input
                      inputMode="decimal"
                      value={worksBudget}
                      onChange={(e) => setWorksBudget(e.target.value)}
                      placeholder="ex: 25000"
                    />
                  </Field>
                </div>

                <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <span className="text-sm font-medium text-stone-700">
                      Frais de notaire auto (≈ 8% ancien)
                    </span>
                    <input
                      type="checkbox"
                      checked={notaryAuto}
                      onChange={(e) => setNotaryAuto(e.target.checked)}
                      className="size-4 accent-amber-600"
                    />
                  </label>
                  {!notaryAuto ? (
                    <div className="mt-4">
                      <Field
                        label="Frais de notaire (montant)"
                        hint="Si tu as le montant exact, saisis-le ici."
                        right="€"
                      >
                        <Input
                          inputMode="decimal"
                          value={notaryFeesManual}
                          onChange={(e) => setNotaryFeesManual(e.target.value)}
                          placeholder="ex: 16000"
                        />
                      </Field>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-stone-500">
                      Calculé automatiquement sur le prix d’achat (hors travaux).
                    </p>
                  )}
                </div>

                <div className="mt-6 grid gap-4 rounded-2xl border border-stone-200 bg-stone-50/70 p-5 sm:grid-cols-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-medium text-stone-700">
                      Frais de Notaire
                    </div>
                    <div className="font-semibold tabular-nums text-stone-900">
                      {formatEUR(numbers.fraisNotaire)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-medium text-stone-700">
                      COÛT TOTAL PROJET
                    </div>
                    <div className="font-semibold tabular-nums text-stone-900">
                      {formatEUR(numbers.coutTotalProjet)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-stone-900">
                  <CreditCard className="size-5 text-stone-500" aria-hidden />
                  CRÉDIT
                </CardTitle>
                <CardDescription>
                  Montant à emprunter = Total projet − Apport. Mensualité calculée avec la
                  formule standard des intérêts composés.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label="Apport personnel" right="€">
                    <Input
                      inputMode="decimal"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                      placeholder="ex: 20000"
                    />
                  </Field>
                  <Field label="Taux d’intérêt (%)" right="%">
                    <Input
                      inputMode="decimal"
                      value={interestRatePct}
                      onChange={(e) => setInterestRatePct(e.target.value)}
                      placeholder="ex: 3,8"
                    />
                  </Field>
                  <Field label="Durée (années)" right="ans">
                    <Input
                      inputMode="decimal"
                      value={durationYears}
                      onChange={(e) => setDurationYears(e.target.value)}
                      placeholder="ex: 20"
                    />
                  </Field>
                </div>

                <div className="mt-8 grid gap-4 rounded-2xl border border-stone-200 bg-stone-50/70 p-5 sm:grid-cols-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-medium text-stone-700">
                      Montant à Emprunter
                    </div>
                    <div className="font-semibold tabular-nums text-stone-900">
                      {formatEUR(numbers.montantAEmprunter)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-medium text-stone-700">
                      MENSUALITÉ
                    </div>
                    <div className="font-semibold tabular-nums text-stone-900">
                      {formatEUR(numbers.mensualite)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-stone-900">
                  <Banknote className="size-5 text-stone-500" aria-hidden />
                  EXPLOITATION
                </CardTitle>
                <CardDescription>
                  Charges mensuelles + vacance locative (5% du loyer).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label="Loyer Mensuel total" right="€">
                    <Input
                      inputMode="decimal"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                      placeholder="ex: 1200"
                    />
                  </Field>
                  <Field label="Taxe foncière (mensuelle)" right="€">
                    <Input
                      inputMode="decimal"
                      value={monthlyPropertyTax}
                      onChange={(e) => setMonthlyPropertyTax(e.target.value)}
                      placeholder="ex: 110"
                    />
                  </Field>
                  <Field label="Charges Copro + Assurance (mensuelle)" right="€">
                    <Input
                      inputMode="decimal"
                      value={monthlyChargesInsurance}
                      onChange={(e) => setMonthlyChargesInsurance(e.target.value)}
                      placeholder="ex: 160"
                    />
                  </Field>
                </div>

                <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-stone-50/70 p-5">
                  <div className="text-sm font-medium text-stone-700">
                    Vacance Locative (5% du loyer)
                  </div>
                  <div className="font-semibold tabular-nums text-stone-900">
                    {formatEUR(numbers.vacanceLocative)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-stone-900">
                  <Percent className="size-5 text-stone-500" aria-hidden />
                  FISCALITÉ
                </CardTitle>
                <CardDescription>
                  Estimation “net-net” après impôts (approx) selon votre régime.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Régime Fiscal">
                    <select
                      value={taxRegime}
                      onChange={(e) =>
                        setTaxRegime(
                          e.target.value as
                            | "micro_foncier"
                            | "reel_nu"
                            | "lmnp_amort"
                            | "sci_is"
                        )
                      }
                      className={cx(
                        "h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 shadow-sm outline-none transition",
                        "focus:border-stone-400 focus:ring-4 focus:ring-amber-500/10"
                      )}
                    >
                      <option value="micro_foncier">Micro-Foncier</option>
                      <option value="reel_nu">Réel Nu</option>
                      <option value="lmnp_amort">LMNP Amortissement</option>
                      <option value="sci_is">SCI à l&apos;IS</option>
                    </select>
                  </Field>

                  <Field label="Tranche Marginale d'Imposition (TMI)">
                    <select
                      value={tmiPct}
                      onChange={(e) => setTmiPct(Number(e.target.value) as 0 | 11 | 30 | 41 | 45)}
                      className={cx(
                        "h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 shadow-sm outline-none transition",
                        "focus:border-stone-400 focus:ring-4 focus:ring-amber-500/10"
                      )}
                    >
                      <option value={0}>0%</option>
                      <option value={11}>11%</option>
                      <option value={30}>30%</option>
                      <option value={41}>41%</option>
                      <option value={45}>45%</option>
                    </select>
                  </Field>
                </div>

                <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50/70 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-stone-700">
                      Impôts estimés (mensuel)
                    </span>
                    <span className="font-semibold tabular-nums text-stone-900">
                      {formatEUR(numbers.impotsMensuels)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-stone-500">
                    Nu réel et LMNP : \((TMI + 17,2\\%)\\) appliqué sur{" "}
                    <span className="font-medium">loyer − charges − intérêts</span>{" "}
                    (LMNP : amort. 3%/an). Intérêts : estimation simple (début de
                    prêt).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-stone-900">
                  <TrendingUp className="size-5 text-stone-500" aria-hidden />
                  BILAN
                </CardTitle>
                <CardDescription>Le rendu final (mensuel + rendement).</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl border border-stone-200 bg-gradient-to-b from-white to-stone-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                    Cash-flow brut
                  </p>
                  <div className={`mt-2 text-4xl font-semibold tracking-tight tabular-nums ${cashflowTone}`}>
                    {formatEUR(numbers.cashflowMensuel)}
                  </div>
                  <p className="mt-3 text-sm text-stone-600">
                    {numbers.cashflowMensuel > 0
                      ? "Positif : le projet s’autofinance (hors aléas)."
                      : numbers.cashflowMensuel < 0
                        ? "Négatif : l’effort d’épargne est à prévoir."
                        : "Neutre : à l’équilibre sur la mensualité et les charges."}
                  </p>

                  <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">
                      Répartition mensuelle
                    </p>
                    {(() => {
                      const income = Math.max(0, numbers.loyer);
                      const credit = Math.max(0, numbers.mensualite);
                      const chargesAll = Math.max(
                        0,
                        numbers.charges + numbers.taxe + numbers.vacanceLocative
                      );
                      const taxes = Math.max(0, numbers.impotsMensuels);
                      const out = credit + chargesAll + taxes;
                      const total = Math.max(1, income + out);

                      const pCredit = (credit / total) * 100;
                      const pCharges = (chargesAll / total) * 100;
                      const pTaxes = (taxes / total) * 100;
                      const pIncome = (income / total) * 100;

                      return (
                        <>
                          <div className="mt-3 h-3 overflow-hidden rounded-full bg-stone-100">
                            <div className="flex h-full w-full">
                              <div
                                className="h-full bg-emerald-500/85"
                                style={{ width: `${pIncome}%` }}
                                title="Loyer"
                              />
                              <div
                                className="h-full bg-sky-500/80"
                                style={{ width: `${pCredit}%` }}
                                title="Crédit"
                              />
                              <div
                                className="h-full bg-amber-500/80"
                                style={{ width: `${pCharges}%` }}
                                title="Charges"
                              />
                              <div
                                className="h-full bg-rose-500/80"
                                style={{ width: `${pTaxes}%` }}
                                title="Impôts"
                              />
                            </div>
                          </div>
                          <div className="mt-3 grid gap-2 text-xs text-stone-600 sm:grid-cols-2">
                            <LegendItem
                              colorClass="bg-emerald-500/85"
                              label={`Loyer: ${formatEUR(income)}`}
                            />
                            <LegendItem
                              colorClass="bg-sky-500/80"
                              label={`Crédit: ${formatEUR(credit)}`}
                            />
                            <LegendItem
                              colorClass="bg-amber-500/80"
                              label={`Charges: ${formatEUR(chargesAll)}`}
                            />
                            <LegendItem
                              colorClass="bg-rose-500/80"
                              label={`Impôts: ${formatEUR(taxes)}`}
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                        Cash-flow net-net (après impôts)
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-stone-900">
                        {formatEUR(numbers.cashflowNetNet)}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
                      {(() => {
                        const brut = numbers.cashflowMensuel;
                        const net = numbers.cashflowNetNet;
                        const denom = Math.max(1, Math.abs(brut));
                        const ratio = Math.min(1, Math.max(0, (net + denom) / (2 * denom)));
                        return (
                          <div
                            className={cx(
                              "h-full",
                              net >= 0 ? "bg-emerald-500" : "bg-rose-500"
                            )}
                            style={{ width: `${Math.round(ratio * 100)}%` }}
                          />
                        );
                      })()}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
                      <span>
                        Impôts estimés :{" "}
                        <span className="font-medium tabular-nums text-stone-700">
                          {formatEUR(numbers.impotsMensuels)}/mois
                        </span>
                      </span>
                      <span className="font-medium text-stone-600">
                        {taxRegime === "lmnp_amort"
                          ? "LMNP"
                          : taxRegime === "reel_nu"
                            ? "Nu réel"
                            : taxRegime === "micro_foncier"
                              ? "Micro-foncier"
                              : "SCI IS"}
                        {" · "}
                        TMI {tmiPct}%
                      </span>
                    </div>
                  </div>

                  {(() => {
                    const annual = {
                      micro_foncier: NaN,
                      reel_nu: numbers.impotsNuReel * 12,
                      lmnp_amort: numbers.impotsLmnp * 12,
                      sci_is: NaN,
                    } as const;

                    const currentKey = taxRegime;
                    const current =
                      currentKey === "reel_nu"
                        ? annual.reel_nu
                        : currentKey === "lmnp_amort"
                          ? annual.lmnp_amort
                          : null;

                    const competitors = [
                      { key: "reel_nu" as const, label: "Nu réel", value: annual.reel_nu },
                      { key: "lmnp_amort" as const, label: "LMNP", value: annual.lmnp_amort },
                    ].filter((r) => r.key !== currentKey);

                    if (current == null) return null;
                    const best = competitors.reduce(
                      (acc, r) => (r.value < acc.value ? r : acc),
                      competitors[0]!
                    );

                    const diff = current - best.value;
                    if (!Number.isFinite(diff) || diff <= 0) {
                      return (
                        <p className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                          <span className="font-semibold">Conseil :</span> au vu de ces
                          hypothèses, ce régime n’est pas moins bon fiscalement que{" "}
                          {best.label}.
                        </p>
                      );
                    }

                    return (
                      <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                        <span className="font-semibold">Conseil :</span> en basculant vers{" "}
                        <span className="font-semibold">{best.label}</span>, vous économisez environ{" "}
                        <span className="font-semibold tabular-nums">
                          {formatEUR(diff)}
                        </span>{" "}
                        d&apos;impôts par an par rapport à votre régime actuel.
                      </p>
                    );
                  })()}
                </div>

                <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                    Rendement net
                  </p>
                  <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-stone-900">
                    {formatPct(numbers.rendementNet)}
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-stone-700">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-stone-600">Coût total projet</span>
                      <span className="font-medium tabular-nums">
                        {formatEUR(numbers.coutTotalProjet)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-stone-600">Loyer</span>
                      <span className="font-medium tabular-nums">
                        {formatEUR(numbers.loyer)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-stone-600">Vacance (5%)</span>
                      <span className="font-medium tabular-nums">
                        {formatEUR(numbers.vacanceLocative)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-stone-600">Taxe foncière</span>
                      <span className="font-medium tabular-nums">
                        {formatEUR(numbers.taxe)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-stone-600">Charges + assurance</span>
                      <span className="font-medium tabular-nums">
                        {formatEUR(numbers.charges)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-stone-600">Mensualité crédit</span>
                      <span className="font-medium tabular-nums">
                        {formatEUR(numbers.mensualite)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

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

