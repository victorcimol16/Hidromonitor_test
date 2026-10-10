/** The Supabase Auth server acts as this MCP resource's OAuth 2.1 authorization server. */
export function supabaseAuthIssuer(): string {
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error("Missing SUPABASE_URL environment variable.");
  return `${url}/auth/v1`;
}
