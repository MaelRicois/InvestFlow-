import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { resolvePublicSupabaseEnv } from "@/lib/supabase/env";

/** Fetch instrumenté pour debugger « fetch failed » (logs = terminal Next.js, pas F12). */
function createSupabaseServerDebugFetch(): typeof fetch {
  return async (input, init) => {
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    const href =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;
    console.log("[Supabase server] Fetch vers:", href);
    try {
      return await fetch(input, init);
    } catch (error) {
      console.error("Détail de l'erreur:", error);
      throw error;
    }
  };
}

export async function createClient() {
  const { supabaseUrl, supabaseAnonKey } = resolvePublicSupabaseEnv();

  const cookieStore = await cookies();
  const { getToken } = await auth();
  const token = await getToken({ template: "supabase" });

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Appel depuis un Server Component : le middleware rafraîchit la session.
        }
      },
    },
    global: {
      fetch: createSupabaseServerDebugFetch(),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });
}
