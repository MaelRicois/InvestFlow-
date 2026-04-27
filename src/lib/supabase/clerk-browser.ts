"use client";

import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase navigateur : envoie le JWT Clerk (template "supabase") pour que les RLS
 * voient auth.jwt()->>'sub'.
 */
export function useClerkSupabase(): SupabaseClient {
  const { getToken } = useAuth();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return useMemo(() => {
    if (!url || !key) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requis."
      );
    }

    return createBrowserClient(url, key, {
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
  }, [url, key, getToken]);
}
