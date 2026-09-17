#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { createServer } from "node:http"
import env from "@/env.js"
import * as registerTool from "@/tools/index.js"
import version from "@/version.js"

const tools = Object.values(registerTool)

function createMcpServer() {
  const server = new McpServer({
    name: "IBGE MCP Server",
    version,
  })

  for (const tool of tools) {
    tool(server)
  }

  return server
}

if (env.TRANSPORT_TYPE === "httpStream") {
  // fresh server + transport pair must be created for every request.
  const httpServer = createServer((req, res) => {
    void (async () => {
      try {
        const server = createMcpServer()
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        })

        res.on("close", () => {
          void Promise.all([transport.close(), server.close()]).catch((error) =>
            console.error("Error closing MCP request:", error),
          )
        })

        await server.connect(transport)
        await transport.handleRequest(req, res)
      } catch (error) {
        console.error("Error handling MCP request:", error)
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" }).end(
            JSON.stringify({
              jsonrpc: "2.0",
              error: { code: -32603, message: "Internal server error" },
              id: null,
            }),
          )
        }
      }
    })()
  })

  httpServer.listen(env.PORT, () => {
    console.log(`IBGE MCP Server listening on http://localhost:${env.PORT}`)
  })
} else {
  const server = createMcpServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
}
