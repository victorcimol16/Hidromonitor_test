import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { supabaseForToken } from "../supabase-for-user";
import type { McpAuthContext } from "../verify-bearer-token";

export function registerListReadingsTool(server: McpServer, auth: McpAuthContext) {
  (server.registerTool as any)(
    "list_readings",
    {
      title: "List water meter readings",
      description:
        "List the signed-in user's water meter readings, most recent first. Each reading has a liters value and a read_at timestamp.",
      inputSchema: z.object({
        limit: z
          .number()
          .int()
          .optional()
          .describe(
            "Maximum number of readings to return. Defaults to 20 when omitted; the server caps at 100.",
          ),
      }),
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async (args: any) => {
      const limit = args?.limit;
      const capped = Math.min(Math.max(limit ?? 20, 1), 100);
      const { data, error } = await supabaseForToken(auth.token)
        .from("readings")
        .select("id, liters, read_at, created_at")
        .order("read_at", { ascending: false })
        .limit(capped);
      if (error) return { content: [{ type: "text", text: error.message }], isError: true } as CallToolResult;
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: { readings: data ?? [] },
      } as CallToolResult;
    },
  );
}
