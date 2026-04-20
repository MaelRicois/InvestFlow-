import { createBrowserClient } from "@supabase/ssr";

/**
 * Client sans JWT Clerk — ne convient pas aux tables protégées par RLS.
 * Préférez {@link useClerkSupabase} dans les composants client.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Variables Supabase manquantes : définissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local"
    );
  }

  return createBrowserClient(url, key);
}
