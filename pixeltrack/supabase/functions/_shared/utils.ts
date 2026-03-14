import { createClient, type SupabaseClient, type User } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables for Edge Functions.")
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

/**
 * Returns a JSON response with CORS headers applied.
 */
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

/**
 * Creates a Supabase client bound to the current user's auth header.
 */
export function createUserClient(authHeader: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  })
}

/**
 * Creates a Supabase admin client using the service role key.
 */
export function createAdminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}

export type AdminCheck =
  | { ok: true; user: User; supabase: SupabaseClient }
  | { ok: false; response: Response }

/**
 * Ensures the request is authenticated as an admin user.
 */
export async function requireAdmin(req: Request): Promise<AdminCheck> {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    return { ok: false, response: jsonResponse({ error: "Missing Authorization header." }, { status: 401 }) }
  }

  const supabase = createUserClient(authHeader)
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    return { ok: false, response: jsonResponse({ error: "Unauthorized." }, { status: 401 }) }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single()

  if (profileError || !profile) {
    return { ok: false, response: jsonResponse({ error: "Unable to verify role." }, { status: 403 }) }
  }

  if (profile.role !== "admin") {
    return { ok: false, response: jsonResponse({ error: "Admin access required." }, { status: 403 }) }
  }

  return { ok: true, user: userData.user, supabase }
}
