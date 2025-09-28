import { FastMCP } from "fastmcp";
import env from "./env.js";
import * as importedTools from "./tools"

const server = new FastMCP({
  name: "IBGE MCP Server",
  version: "1.0.0",
});

const tools = Object.values(importedTools);

for (const tool of tools) {
  server.addTool(tool as any);
}

server.start({
  transportType: env.TRANSPORT_TYPE,
  httpStream: {
    port: env.PORT,
  },
});