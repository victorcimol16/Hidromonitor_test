import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { TablesInsert } from "@/integrations/supabase/types";
import { supabaseForToken } from "../supabase-for-user";
import type { McpAuthContext } from "../verify-bearer-token";

export function registerCreateReadingTool(server: McpServer, auth: McpAuthContext) {
  (server.registerTool as any)(
    "create_reading",
    {
      title: "Record a water meter reading",
      description:
        "Insert a new water meter reading for the signed-in user. `liters` must be zero or positive. `read_at` is optional; defaults to now.",
      inputSchema: z.object({
        liters: z.number().describe("Meter reading in liters. Must be >= 0."),
        read_at: z
          .string()
          .datetime()
          .optional()
          .describe(
            "ISO 8601 timestamp for when the reading was taken. Defaults to the current server time when omitted.",
          ),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async (args: any) => {
      const { liters, read_at } = args;
      if (liters < 0) {
        return {
          content: [{ type: "text", text: "liters must be >= 0" }],
          isError: true,
        } as CallToolResult;
      }
      const row: TablesInsert<"readings"> = { user_id: auth.userId, liters };
      if (read_at) row.read_at = read_at;
      const { data, error } = await supabaseForToken(auth.token)
        .from("readings")
        .insert(row)
        .select("id, liters, read_at, created_at")
        .single();
      if (error) return { content: [{ type: "text", text: error.message }], isError: true } as CallToolResult;
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: { reading: data },
      } as CallToolResult;
    },
  );
}
