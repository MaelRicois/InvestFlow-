import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("annual_salary")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message, code: (error as { code?: string }).code },
      { status: 400 }
    );
  }

  const salary = data?.annual_salary;
  return NextResponse.json({
    annual_salary:
      salary != null && Number.isFinite(Number(salary))
        ? Number(salary)
        : null,
  });
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { annual_salary?: unknown };
  try {
    body = (await request.json()) as { annual_salary?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = body.annual_salary;
  const annual_salary =
    raw === null || raw === ""
      ? null
      : Number(typeof raw === "string" ? raw.replace(/\s/g, "").replace(",", ".") : raw);

  if (annual_salary != null && (!Number.isFinite(annual_salary) || annual_salary < 0)) {
    return NextResponse.json(
      { error: "Salaire annuel invalide" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("user_profiles").upsert(
    {
      user_id: userId,
      annual_salary,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return NextResponse.json(
      { error: error.message, code: (error as { code?: string }).code },
      { status: 400 }
    );
  }

  return NextResponse.json({ annual_salary });
}
