import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createSupabaseFetch } from "@/integrations/supabase/api-key-fetch";
import { resolveOrigin } from "./resolve-origin";

export type McpAuthContext = { token: string; userId: string };

// Supabase issues this audience for normal user-scoped access tokens.
const SUPABASE_AUDIENCE = "authenticated";

function unauthorized(request: Request, message: string): Response {
  const resourceMetadataUrl = `${resolveOrigin(request)}/.well-known/oauth-protected-resource`;
  return new Response(JSON.stringify({ error: "invalid_token", error_description: message }), {
    status: 401,
    headers: {
      "content-type": "application/json",
      "www-authenticate": `Bearer error="invalid_token", error_description="${message}", resource_metadata="${resourceMetadataUrl}"`,
    },
  });
}

/** Validates the MCP request's bearer token against Supabase Auth and resolves the calling user. */
export async function verifyMcpBearerToken(request: Request): Promise<McpAuthContext | Response> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return unauthorized(request, "Missing or malformed Authorization header");
  }
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return unauthorized(request, "Missing bearer token");

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return new Response("Server misconfigured: missing Supabase environment variables.", {
      status: 500,
    });
  }

  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    return unauthorized(request, "Invalid or expired token");
  }
  if (data.claims.aud !== SUPABASE_AUDIENCE) {
    return unauthorized(request, "Unexpected token audience");
  }

  return { token, userId: data.claims.sub };
}
