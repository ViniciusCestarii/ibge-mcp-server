import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import axios from "axios"
import env from "@/env.js"
import { Pesquisa, PesquisaResponse } from "@/types/agregado.js"

export function registerPesquisasTool(server: McpServer) {
  server.registerTool(
    "pesquisas",
    {
      description: "Busca pesquisas do IBGE",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async () => {
      const response = await axios.get<Pesquisa[]>(env.IBGE_API_AGREGADOS)

      const pesquisas: PesquisaResponse[] = response.data.map((pesquisa) => ({
        pesquisaId: pesquisa.id,
        nome: pesquisa.nome,
      }))

      return {
        content: [{ type: "text", text: JSON.stringify(pesquisas, null, 2) }],
      }
    },
  )
}
