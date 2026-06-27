import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import axios from "axios"
import { z } from "zod"
import env from "@/env.js"
import { AgregadoResponse, Pesquisa } from "@/types/agregado.js"

export function registerAgregadosTool(server: McpServer) {
  server.registerTool(
    "agregados",
    {
      description: "Busca agregados de uma pesquisa por pesquisaId do IBGE",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
      inputSchema: {
        pesquisaId: z.string(),
      },
    },
    async ({ pesquisaId }) => {
      const response = await axios.get<Pesquisa[]>(env.IBGE_API_AGREGADOS)

      const pesquisa = response.data.filter(
        (pesquisa) => pesquisa.id === pesquisaId,
      )[0]

      if (!pesquisa) {
        return {
          content: [
            {
              type: "text",
              text: `Pesquisa com id ${pesquisaId} não encontrada.`,
            },
          ],
        }
      }

      const agregados: AgregadoResponse[] = pesquisa.agregados.map(
        (agregado) => ({
          agregadoId: agregado.id,
          nome: agregado.nome,
        }),
      )

      return {
        content: [{ type: "text", text: JSON.stringify(agregados, null, 2) }],
      }
    },
  )
}
