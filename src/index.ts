#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { createServer } from "node:http"
import env from "@/env.js"
import * as registerTool from "@/tools/index.js"
import version from "@/version.js"

const server = new McpServer({
  name: "IBGE MCP Server",
  version,
})

const tools = Object.values(registerTool)

for (const tool of tools) {
  tool(server)
}

if (env.TRANSPORT_TYPE === "httpStream") {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  })
  await server.connect(transport)

  const httpServer = createServer((req, res) => {
    transport.handleRequest(req, res)
  })

  httpServer.listen(env.PORT, () => {
    console.log(`IBGE MCP Server listening on http://localhost:${env.PORT}`)
  })
} else {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}
