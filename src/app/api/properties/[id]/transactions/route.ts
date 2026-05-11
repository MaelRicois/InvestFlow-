import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function parseId(params: { id?: string }) {
  const raw = params.id ?? "";
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 && Number.isInteger(n) ? n : null;
}

type Body = {
  occurred_on?: string;
  label?: string;
  amount?: number;
  category?: string | null;
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const propertyId = parseId(await context.params);
  if (propertyId == null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const occurredOn =
    typeof body.occurred_on === "string" ? body.occurred_on.trim() : "";
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const amount = Number(body.amount);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(occurredOn)) {
    return NextResponse.json(
      { error: "Date invalide (format AAAA-MM-JJ)" },
      { status: 400 }
    );
  }
  if (!label) {
    return NextResponse.json({ error: "Libellé requis" }, { status: 400 });
  }
  if (!Number.isFinite(amount)) {
    return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: prop, error: propErr } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("user_id", userId)
    .maybeSingle();

  if (propErr) {
    return NextResponse.json(
      { error: propErr.message },
      { status: 400 }
    );
  }
  if (!prop) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const category =
    typeof body.category === "string" && body.category.trim()
      ? body.category.trim()
      : null;

  const { data, error } = await supabase
    .from("property_transactions")
    .insert({
      property_id: propertyId,
      user_id: userId,
      occurred_on: occurredOn,
      label,
      amount,
      category,
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
