import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { ToolDefinition } from "./ai/provider.js"

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
)

/**
 * Thin wrapper around the MCP client. It launches the real server as a
 * subprocess over stdio (`tsx src/index.ts`), so tests exercise the exact
 * tools an MCP host would see.
 */
export class McpTestClient {
  private client: Client
  private transport: StdioClientTransport

  constructor() {
    this.transport = new StdioClientTransport({
      command: "npx",
      args: ["tsx", "src/index.ts"],
      cwd: projectRoot,
      env: { ...process.env, TRANSPORT_TYPE: "stdio" } as Record<
        string,
        string
      >,
    })
    this.client = new Client({ name: "ibge-mcp-test-client", version: "1.0.0" })
  }

  async connect(): Promise<void> {
    await this.client.connect(this.transport)
  }

  async close(): Promise<void> {
    await this.client.close()
  }

  /** Lists the server's tools in the provider-neutral shape. */
  async listTools(): Promise<ToolDefinition[]> {
    const { tools } = await this.client.listTools()
    return tools.map((tool) => ({
      name: tool.name,
      description: tool.description ?? "",
      parameters: (tool.inputSchema ?? {
        type: "object",
        properties: {},
      }) as Record<string, unknown>,
    }))
  }

  /** Calls a tool and flattens its text content into a single string. */
  async callTool(name: string, args: Record<string, unknown>): Promise<string> {
    const result = await this.client.callTool({ name, arguments: args })
    const content = (result.content ?? []) as { type: string; text?: string }[]
    return content
      .filter((part) => part.type === "text" && part.text)
      .map((part) => part.text)
      .join("\n")
  }
}
