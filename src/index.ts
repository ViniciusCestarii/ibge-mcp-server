import { FastMCP } from "fastmcp";
import { addTool } from "./tools/add.js";
import env from "./env.js";

const server = new FastMCP({
  name: "IBGE MCP Server",
  version: "1.0.0",
});

server.addTool(addTool);

server.start({
  transportType: env.TRANSPORT_TYPE,
  httpStream: {
    port: env.PORT,
  },
});