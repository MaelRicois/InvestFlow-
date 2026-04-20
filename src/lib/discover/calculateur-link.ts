import type { DiscoverListing } from "./types";

export function buildCalculateurHref(listing: DiscoverListing): string {
  const params = new URLSearchParams();
  params.set("name", listing.title);
  params.set("purchase_price", String(Math.round(listing.purchasePriceEur)));
  params.set("works_budget", String(Math.round(listing.worksBudgetEur)));
  params.set("monthly_rent", String(Math.round(listing.monthlyRentEur)));
  params.set("tax_monthly", String(Math.round(listing.monthlyPropertyTaxEur)));
  params.set(
    "charges_monthly",
    String(Math.round(listing.monthlyChargesInsuranceEur))
  );
  return `/calculateur?${params.toString()}`;
}
