import OpenAI from "openai";
import { NextResponse } from "next/server";

type AnalyzeResult = {
  name: string;
  purchase_price: number;
  renovation_cost: number;
  monthly_rent: number;
  tax_monthly: number;
  charges_monthly: number;
};

function toFiniteNumber(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeResult(value: unknown): AnalyzeResult | null {
  if (value == null || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;

  const name = typeof obj.name === "string" ? obj.name.trim() : "";
  if (!name) return null;

  return {
    name,
    purchase_price: Math.max(0, toFiniteNumber(obj.purchase_price)),
    renovation_cost: Math.max(0, toFiniteNumber(obj.renovation_cost)),
    monthly_rent: Math.max(0, toFiniteNumber(obj.monthly_rent)),
    tax_monthly: Math.max(0, toFiniteNumber(obj.tax_monthly)),
    charges_monthly: Math.max(0, toFiniteNumber(obj.charges_monthly)),
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  let body: { text?: unknown };
  try {
    body = (await request.json()) as { text?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const client = new OpenAI({ apiKey });

  const schemaDescription = `Tu es "IA Chasseur d'Annonces".
Analyse le texte d'une annonce immobilière (France) et renvoie IMPÉRATIVEMENT un objet JSON valide (pas de Markdown, pas de texte autour) dont les clés correspondent EXACTEMENT à :
- name (string) : titre de l'annonce (si absent, crée un titre court basé sur ville + type + surface)
- purchase_price (number) : prix d'achat
- renovation_cost (number) : estimation des travaux si mentionné, sinon 0
- monthly_rent (number) : loyer mensuel estimé ou mentionné
- tax_monthly (number) : taxe foncière annuelle / 12 (si taxe mentionnée en annuel, convertis; si absent, estime)
- charges_monthly (number) : charges copro mensuelles (si absent, estime)

RÈGLES:
1) Si une donnée manque, fais une estimation réaliste basée sur la ville et la surface mentionnées (si elles existent) ou, à défaut, une estimation prudente et crédible.
2) Tous les montants doivent être des nombres (pas de chaîne), en euros.
3) Le JSON doit contenir toutes les clés, même si certaines sont 0.`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: schemaDescription },
        { role: "user", content: text },
      ],
    });

    const raw = response.choices?.[0]?.message?.content ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Model did not return valid JSON" },
        { status: 502 }
      );
    }

    const normalized = normalizeResult(parsed);
    if (!normalized) {
      return NextResponse.json(
        { error: "Model returned unexpected JSON shape" },
        { status: 502 }
      );
    }

    return NextResponse.json(normalized, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

