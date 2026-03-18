// @ts-expect-error Deno types not available in IDE
import { createClient, type SupabaseClient, type User } from "https://esm.sh/@supabase/supabase-js@2"

// @ts-expect-error Deno types not available in IDE
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
// @ts-expect-error Deno types not available in IDE
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? ""
// @ts-expect-error Deno types not available in IDE
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables for Edge Functions.")
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

export function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...(init.headers ?? {}),
    },
  })
}

export function createUserClient(authHeader: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
}

export function createAdminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}

export type AdminCheck =
  | { ok: true; user: User; supabase: SupabaseClient }
  | { ok: false; response: Response }

export type AuthenticatedUserCheck =
  | { ok: true; user: User; supabase: SupabaseClient }
  | { ok: false; response: Response }

export async function requireAdmin(req: Request): Promise<AdminCheck> {
  const authHeader = req.headers.get("Authorization")

  if (!authHeader) {
    return { ok: false, response: jsonResponse({ error: "Missing Authorization header" }, { status: 401 }) }
  }

  const supabase = createUserClient(authHeader)
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    return { ok: false, response: jsonResponse({ error: "Invalid JWT" }, { status: 401 }) }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single()

  if (profileError || !profile) {
    return { ok: false, response: jsonResponse({ error: "Profile not found" }, { status: 403 }) }
  }

  if (profile.role !== "admin") {
    return { ok: false, response: jsonResponse({ error: `Access denied. Role: ${profile.role}` }, { status: 403 }) }
  }

  return { ok: true, user: userData.user, supabase }
}

export async function fetchProfileDisplayName(admin: SupabaseClient, userId: string): Promise<string | null> {
  const { data, error } = await admin
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    console.error(`Failed to load profile ${userId}: ${error.message}`)
    return null
  }

  return data?.display_name ?? null
}

export async function requireAuthenticatedUser(req: Request): Promise<AuthenticatedUserCheck> {
  const authHeader = req.headers.get("Authorization")

  if (!authHeader) {
    return { ok: false, response: jsonResponse({ error: "Missing Authorization header" }, { status: 401 }) }
  }

  const supabase = createUserClient(authHeader)
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    return { ok: false, response: jsonResponse({ error: "Invalid JWT" }, { status: 401 }) }
  }

  return { ok: true, user: userData.user, supabase }
}
