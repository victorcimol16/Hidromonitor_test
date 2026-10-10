import { createFileRoute } from "@tanstack/react-router";
import { resolveOrigin } from "@/lib/mcp/resolve-origin";
import { supabaseAuthIssuer } from "@/lib/mcp/supabase-issuer";

// RFC 9728 OAuth 2.0 Protected Resource Metadata — tells MCP clients which
// authorization server (Supabase Auth) issues tokens accepted by /mcp.
export const Route = createFileRoute("/.well-known/oauth-protected-resource")({
  server: {
    handlers: {
      GET: ({ request }) =>
        Response.json({
          resource: `${resolveOrigin(request)}/mcp`,
          authorization_servers: [supabaseAuthIssuer()],
        }),
    },
  },
});
