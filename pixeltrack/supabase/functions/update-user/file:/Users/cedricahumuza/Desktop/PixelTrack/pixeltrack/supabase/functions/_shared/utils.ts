import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables for Edge Functions.");
}
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
/**
 * Returns a JSON response with CORS headers applied.
 */ export function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...init.headers ?? {}
    }
  });
}
/**
 * Creates a Supabase client bound to the current user's auth header.
 */ export function createUserClient(authHeader) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: authHeader
      }
    }
  });
}
/**
 * Creates a Supabase admin client using the service role key.
 */ export function createAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}
/**
 * Ensures the request is authenticated as an admin user.
 */ export async function requireAdmin(req) {
  const authHeader = req.headers.get("Authorization");
  console.log("[requireAdmin] Auth header:", authHeader ? "present" : "missing");
  if (!authHeader) {
    return {
      ok: false,
      response: jsonResponse({
        error: "Missing Authorization header."
      }, {
        status: 401
      })
    };
  }
  const supabase = createUserClient(authHeader);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  console.log("[requireAdmin] getUser result:", {
    hasUser: !!userData?.user,
    error: userError?.message
  });
  if (userError || !userData?.user) {
    return {
      ok: false,
      response: jsonResponse({
        error: "Unauthorized: " + (userError?.message || "No user found")
      }, {
        status: 401
      })
    };
  }
  console.log("[requireAdmin] User ID:", userData.user.id);
  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", userData.user.id).single();
  console.log("[requireAdmin] Profile result:", {
    hasProfile: !!profile,
    role: profile?.role,
    error: profileError?.message
  });
  if (profileError || !profile) {
    return {
      ok: false,
      response: jsonResponse({
        error: "Unable to verify role: " + (profileError?.message || "No profile found")
      }, {
        status: 403
      })
    };
  }
  if (profile.role !== "admin") {
    return {
      ok: false,
      response: jsonResponse({
        error: "Admin access required. Your role: " + profile.role
      }, {
        status: 403
      })
    };
  }
  return {
    ok: true,
    user: userData.user,
    supabase
  };
}
