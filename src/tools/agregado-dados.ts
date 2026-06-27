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
        agregadoId: z
          .string()
          .describe(
            "Id do agregado, obtido pela ferramenta 'agregados'. Ex.: '6579'.",
          ),
        periodo: z
          .string()
          .describe(
            "Período dos dados. Um ano (ex.: '2018'), vários separados por '|' " +
              "(ex.: '2017|2018'), um intervalo (ex.: '2017-2019') ou os últimos N " +
              "períodos com número negativo (ex.: '-6'). Use os períodos válidos " +
              "informados em 'agregado-metadados'.",
          ),
        variavelId: z
          .string()
          .describe(
            "Id da variável, obtido em 'agregado-metadados'. Ex.: '9324'." +
              "Várias variáveis podem ser separadas por '|'.",
          ),
        localidades: z
          .string()
          .describe(
            "Localidades no formato 'N<nivel>[<id>]', combinando o código do " +
              "nível territorial (de 'agregado-metadados', ex.: N6 = município, " +
              "N3 = estado, N1 = Brasil) com o id da localidade (da ferramenta " +
              "'localidades'). Ex.: 'N6[3550308]' para o município de São Paulo, " +
              "'N3[35]' para o estado de São Paulo. Vários ids: 'N6[3550308,3304557]'; " +
              "todos do nível: 'N3[all]'.",
          ),
        classificacao: z
          .string()
          .optional()
          .describe(
            "Filtro opcional de classificações no formato " +
              "'<classificacaoId>[<categoriaId>,...]', conforme as classificações " +
              "listadas em 'agregado-metadados'. Ex.: '2[4,5]'.",
          ),
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
