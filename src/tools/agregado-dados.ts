import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import axios from "axios"
import { z } from "zod"
import env from "@/env.js"

export function registerAgregadoDadosTool(server: McpServer) {
  server.registerTool(
    "agregado-dados",
    {
      description: "Busca os dados de um agregado no IBGE",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
      inputSchema: {
        agregadoId: z.string(),
        periodo: z.string(),
        variavelId: z.string(),
        localidades: z.string(),
        classificacao: z.string().optional(),
      },
    },
    async ({ agregadoId, periodo, variavelId, localidades, classificacao }) => {
      let url = `${env.IBGE_API_AGREGADOS}/${agregadoId}/periodos/${periodo}/variaveis/${variavelId}?localidades=${encodeURIComponent(localidades)}`

      if (classificacao) {
        url += `&classificacao=${encodeURIComponent(classificacao)}`
      }

      const response = await axios.get<object[]>(url)

      const dados = {
        fonteUrl: url,
        dados: response.data,
      }

      return {
        content: [{ type: "text", text: JSON.stringify(dados, null, 2) }],
      }
    },
  )
}
