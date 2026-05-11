"use client";

import { useEffect } from "react";

/**
 * Vérifie dans la console navigateur (F12) que NEXT_PUBLIC_SUPABASE_URL est présent
 * dans le bundle client. Le fetch PostgREST du dashboard, lui, s’exécute côté serveur
 * (logs dans le terminal `next dev`).
 */
export function DashboardSupabaseEnvLog() {
  useEffect(() => {
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.info(
      "[InvestFlow] Dashboard : les données viennent du client Supabase serveur vers l’URL absolue PostgREST (https://…supabase.co/rest/v1/…), pas de GET /api/properties pour la liste."
    );
  }, []);
  return null;
}
