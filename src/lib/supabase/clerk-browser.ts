"use client";

import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { resolvePublicSupabaseEnv } from "@/lib/supabase/env";

/**
 * Client Supabase navigateur : envoie le JWT Clerk (template "supabase") pour que les RLS
 * voient auth.jwt()->>'sub'.
 */
export function useClerkSupabase(): SupabaseClient {
  const { getToken } = useAuth();

  return useMemo(() => {
    const { supabaseUrl, supabaseAnonKey } = resolvePublicSupabaseEnv();

    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
      isSingleton: false,
      global: {
        fetch: async (input, init) => {
          const headers = new Headers(init?.headers);
          const token = await getToken({ template: "supabase" });
          if (token) headers.set("Authorization", `Bearer ${token}`);
          return fetch(input, { ...init, headers });
        },
      },
    });
  }, [getToken]);
}
