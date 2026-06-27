import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import axios from "axios"
import { z } from "zod"
import env from "@/env.js"
import {
  Estado,
  EstadoResponse,
  Municipio,
  MunicipioResponse,
} from "@/types/localidade.js"

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase()

const matchEstado = (estado: Estado, busca: string) => {
  const buscaNormalizada = normalize(busca)
  return (
    normalize(estado.sigla) === buscaNormalizada ||
    normalize(estado.nome) === buscaNormalizada
  )
}

export function registerLocalidadesTool(server: McpServer) {
  server.registerTool(
    "localidades",
    {
      description:
        "Descobre o id de localidade do IBGE de um estado ou cidade. " +
        "Use 'estado' para buscar um estado por nome ou sigla (ex.: 'São Paulo' ou 'SP'). " +
        "Para buscar uma cidade, use 'cidade' como objeto { estado, nome } para evitar ambiguidade, " +
        "pois existem cidades com o mesmo nome em estados diferentes. " +
        "É possível buscar estado e cidade na mesma chamada.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
      inputSchema: {
        estado: z
          .string()
          .optional()
          .describe("Nome ou sigla do estado, ex.: 'São Paulo' ou 'SP'"),
        cidade: z
          .object({
            estado: z
              .string()
              .describe("Nome ou sigla do estado da cidade, ex.: 'SP'"),
            nome: z.string().describe("Nome da cidade, ex.: 'Campinas'"),
          })
          .optional()
          .describe(
            "Cidade a ser buscada, com o estado para desambiguar o nome",
          ),
      },
    },
    async ({ estado, cidade }) => {
      if (!estado && !cidade) {
        return {
          content: [
            {
              type: "text",
              text: "Informe 'estado' ou 'cidade' para buscar uma localidade.",
            },
          ],
        }
      }

      const resultado: {
        estado?: EstadoResponse | string
        cidade?: MunicipioResponse[] | string
      } = {}

      if (estado) {
        const response = await axios.get<Estado[]>(
          `${env.IBGE_API_LOCALIDADES}/estados`,
        )

        const encontrado = response.data.find((uf) => matchEstado(uf, estado))

        resultado.estado = encontrado
          ? {
              localidadeId: encontrado.id,
              sigla: encontrado.sigla,
              nome: encontrado.nome,
              regiao: encontrado.regiao.nome,
            }
          : `Estado '${estado}' não encontrado.`
      }

      if (cidade) {
        const response = await axios.get<Municipio[]>(
          `${env.IBGE_API_LOCALIDADES}/municipios`,
        )

        const nomeNormalizado = normalize(cidade.nome)

        const encontrados = response.data.filter(
          (municipio) =>
            normalize(municipio.nome) === nomeNormalizado &&
            matchEstado(municipio.microrregiao.mesorregiao.UF, cidade.estado),
        )

        resultado.cidade =
          encontrados.length > 0
            ? encontrados.map((municipio) => {
                const uf = municipio.microrregiao.mesorregiao.UF
                return {
                  localidadeId: municipio.id,
                  nome: municipio.nome,
                  estado: {
                    localidadeId: uf.id,
                    sigla: uf.sigla,
                    nome: uf.nome,
                  },
                }
              })
            : `Cidade '${cidade.nome}' não encontrada no estado '${cidade.estado}'.`
      }

      return {
        content: [{ type: "text", text: JSON.stringify(resultado, null, 2) }],
      }
    },
  )
}
