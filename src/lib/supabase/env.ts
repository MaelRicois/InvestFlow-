/**
 * Lecture et validation de NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Une URL mal formée (espaces, guillemets, mauvais schéma) provoque souvent `TypeError: fetch failed` côté Node.
 */

function trimEnv(value: string | undefined): string {
  if (value == null) return "";
  let v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

export type PublicSupabaseEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function resolvePublicSupabaseEnv(): PublicSupabaseEnv {
  const rawUrl = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const rawKey = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!rawUrl || !rawKey) {
    throw new Error(
      [
        "Variables Supabase manquantes.",
        "Ajoutez dans .env.local à la racine du projet :",
        "  NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co",
        "  NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé anon du tableau Project Settings → API>",
        "Puis redémarrez le serveur de dev. Sur Vercel : Settings → Environment Variables (même noms, redéploiement).",
      ].join("\n")
    );
  }

  const supabaseUrl = rawUrl.replace(/\/+$/, "");

  try {
    const parsed = new URL(supabaseUrl);
    const isLocal =
      parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (parsed.protocol !== "https:" && !(isLocal && parsed.protocol === "http:")) {
      throw new Error(
        "L’URL doit commencer par https:// (ou http://localhost / 127.0.0.1 pour Supabase local)."
      );
    }
    if (!parsed.host) {
      throw new Error("Hôte vide");
    }
  } catch (e) {
    const hint =
      e instanceof TypeError
        ? "Valeur illisible comme URL (espaces, caractères invisibles ou guillemets ?)."
        : e instanceof Error
          ? e.message
          : String(e);
    throw new Error(
      [
        `NEXT_PUBLIC_SUPABASE_URL est invalide (${hint})`,
        `Valeur reçue (tronquée) : ${rawUrl.slice(0, 80)}${rawUrl.length > 80 ? "…" : ""}`,
        "Exemple attendu : https://abcdefghijklmnop.supabase.co",
      ].join("\n")
    );
  }

  return { supabaseUrl, supabaseAnonKey: rawKey };
}
