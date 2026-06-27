import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import axios from "axios"
import { z } from "zod"
import env from "@/env.js"
import {
  AgregadoMetadados,
  AgregadoMetadadosResponse,
} from "@/types/agregado.js"

export function registerAgregadoMetadadosTool(server: McpServer) {
  server.registerTool(
    "agregado-metadados",
    {
      description:
        "Busca metadados (variáveis, nivelTerritorial, periodicidade, etc.) de um agregado por agregadoId",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
      inputSchema: {
        agregadoId: z
          .string()
          .describe(
            "Id do agregado, obtido pela ferramenta 'agregados'. Ex.: '6579'.",
          ),
      },
    },
    async ({ agregadoId }) => {
      const response = await axios.get<AgregadoMetadados>(
        `${env.IBGE_API_AGREGADOS}/${agregadoId}/metadados`,
      )

      const data = response.data

      const agregadoMetadados: AgregadoMetadadosResponse = {
        agregadoId: data.id,
        nome: data.nome,
        pesquisa: data.pesquisa,
        assunto: data.assunto,
        periodicidade: data.periodicidade,
        nivelTerritorial: data.nivelTerritorial,
        variaveis: data.variaveis.map((variavel) => ({
          variavelId: variavel.id,
          nome: variavel.nome,
          unidade: variavel.unidade,
          sumarizacao: variavel.sumarizacao,
        })),
        classificacoes: data.classificacoes,
      }

      return {
        content: [
          { type: "text", text: JSON.stringify(agregadoMetadados, null, 2) },
        ],
      }
    },
  )
}
