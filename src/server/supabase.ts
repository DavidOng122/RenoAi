import "server-only";

import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const EVIDENCE_BUCKET = "repair-evidence";

function required(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" | "AUTH_SECRET") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export function ownerIdForEmail(email: string) {
  return createHmac("sha256", required("AUTH_SECRET"))
    .update(email.trim().toLowerCase())
    .digest("hex");
}

export function createRenoSupabase(ownerId: string) {
  return createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
      global: { headers: { "x-reno-owner": ownerId } },
    },
  );
}

export function createRenoPublicSupabase() {
  return createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
    },
  );
}
