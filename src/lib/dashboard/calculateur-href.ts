import type { DashboardPropertyRow } from "./types";
import { toNum } from "./format";

export function buildCalculateurHrefFromProperty(p: DashboardPropertyRow) {
  const params = new URLSearchParams();
  params.set("propertyId", String(p.id));
  const name = p.name?.trim() ?? "";
  if (name) params.set("name", name);
  params.set("purchase_price", String(toNum(p.purchase_price)));
  params.set("works_budget", String(toNum(p.renovation_cost)));
  params.set("monthly_rent", String(toNum(p.monthly_rent)));
  return `/calculateur?${params.toString()}`;
}
