import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  computePropertyMetrics,
  type CreditType,
} from "@/lib/dashboard/property-metrics";

const CREDIT_TYPES: CreditType[] = ["amortissable", "in_fine", "comptant"];

function parseCreditType(raw: unknown): CreditType {
  if (typeof raw === "string" && CREDIT_TYPES.includes(raw as CreditType)) {
    return raw as CreditType;
  }
  return "amortissable";
}

type PropertyPayload = {
  name?: string;
  purchase_price?: number;
  monthly_rent?: number;
  charges_monthly?: number;
  tax_monthly?: number;
  credit_type?: string;
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: PropertyPayload;
  try {
    body = (await request.json()) as PropertyPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const purchase = Number(body.purchase_price);
  const rent = Number(body.monthly_rent);
  const charges = Number(body.charges_monthly ?? 0);
  const tax = Number(body.tax_monthly ?? 0);
  if (!Number.isFinite(purchase) || purchase < 0) {
    return NextResponse.json(
      { error: "Prix d'achat invalide" },
      { status: 400 }
    );
  }
  if (!Number.isFinite(rent) || rent < 0) {
    return NextResponse.json(
      { error: "Loyer mensuel invalide" },
      { status: 400 }
    );
  }

  const creditType = parseCreditType(body.credit_type);
  const metrics = computePropertyMetrics({
    purchasePrice: purchase,
    renovationCost: 0,
    monthlyRent: rent,
    taxMonthly: tax,
    chargesMonthly: charges,
    creditType,
  });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .insert({
      user_id: userId,
      name: (body.name ?? "").trim() || "Nouveau bien",
      purchase_price: purchase,
      renovation_cost: metrics.renovation_cost,
      notary_fees: metrics.notary_fees,
      total_project_cost: metrics.total_project_cost,
      monthly_rent: rent,
      tax_monthly: tax,
      charges_monthly: charges,
      vacancy_monthly: metrics.vacancy_monthly,
      monthly_cashflow: metrics.monthly_cashflow,
      net_yield: metrics.net_yield,
      credit_type: creditType,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message, code: (error as { code?: string }).code },
      { status: 400 }
    );
  }

  return NextResponse.json({ id: data?.id }, { status: 201 });
}
