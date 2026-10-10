import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { supabaseForToken } from "../supabase-for-user";
import type { McpAuthContext } from "../verify-bearer-token";

export function registerDeleteReadingTool(server: McpServer, auth: McpAuthContext) {
  (server.registerTool as any)(
    "delete_reading",
    {
      title: "Delete a water meter reading",
      description: "Permanently delete one of the signed-in user's readings by id.",
      inputSchema: z.object({
        id: z
          .string()
          .describe("UUID of the reading to delete. Must belong to the signed-in user."),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args: any) => {
      const { id } = args;
      const { error } = await supabaseForToken(auth.token).from("readings").delete().eq("id", id);
      if (error) return { content: [{ type: "text", text: error.message }], isError: true } as CallToolResult;
      return {
        content: [{ type: "text", text: `Deleted reading ${id}` }],
        structuredContent: { id, deleted: true },
      } as CallToolResult;
    },
  );
}
