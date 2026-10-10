import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerListReadingsTool } from "./tools/list-readings";
import { registerCreateReadingTool } from "./tools/create-reading";
import { registerDeleteReadingTool } from "./tools/delete-reading";
import type { McpAuthContext } from "./verify-bearer-token";

/** Builds a fresh MCP server scoped to one authenticated request — never share an instance across requests/clients. */
export function buildMcpServer(auth: McpAuthContext): McpServer {
  const server = new McpServer(
    { name: "hidromonitor-mcp", version: "0.1.0" },
    {
      instructions:
        "Tools to read and manage the signed-in user's water meter readings on HidroMonitor. Use `list_readings` to see recent readings, `create_reading` to log a new liters value, and `delete_reading` to remove one by id.",
    },
  );
  registerListReadingsTool(server, auth);
  registerCreateReadingTool(server, auth);
  registerDeleteReadingTool(server, auth);
  return server;
}
