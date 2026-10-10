import { createFileRoute } from "@tanstack/react-router";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { buildMcpServer } from "@/lib/mcp/build-server";
import { verifyMcpBearerToken } from "@/lib/mcp/verify-bearer-token";

export const Route = createFileRoute("/mcp")({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        const auth = await verifyMcpBearerToken(request);
        if (auth instanceof Response) return auth;

        const server = buildMcpServer(auth);
        const transport = new WebStandardStreamableHTTPServerTransport();
        await server.connect(transport);
        return transport.handleRequest(request);
      },
    },
  },
});
