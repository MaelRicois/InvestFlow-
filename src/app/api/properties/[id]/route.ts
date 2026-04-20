import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

type PropertyPayload = {
  name?: string;
  purchase_price?: number;
  renovation_cost?: number;
  notary_fees?: number;
  total_project_cost?: number;
  monthly_rent?: number;
  tax_monthly?: number;
  charges_monthly?: number;
  vacancy_monthly?: number;
  monthly_cashflow?: number;
  net_yield?: number;
  credit_type?: string;
};

function parseId(params: { id?: string }) {
  const raw = params.id ?? "";
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = parseId(await context.params);
  if (id == null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: PropertyPayload;
  try {
    body = (await request.json()) as PropertyPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .update({
      name: body.name != null ? body.name.trim() : undefined,
      purchase_price: body.purchase_price ?? undefined,
      renovation_cost: body.renovation_cost ?? undefined,
      notary_fees: body.notary_fees ?? undefined,
      total_project_cost: body.total_project_cost ?? undefined,
      monthly_rent: body.monthly_rent ?? undefined,
      tax_monthly: body.tax_monthly ?? undefined,
      charges_monthly: body.charges_monthly ?? undefined,
      vacancy_monthly: body.vacancy_monthly ?? undefined,
      monthly_cashflow: body.monthly_cashflow ?? undefined,
      net_yield: body.net_yield ?? undefined,
      credit_type: body.credit_type ?? undefined,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message, code: (error as { code?: string }).code },
      { status: 400 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ id: data.id }, { status: 200 });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = parseId(await context.params);
  if (id == null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message, code: (error as { code?: string }).code },
      { status: 400 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

