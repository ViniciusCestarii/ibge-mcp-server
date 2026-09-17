import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

const FUSO_HORARIO = "America/Sao_Paulo"

interface DataHoraResponse {
  dataHora: string
  data: string
  hora: string
  ano: number
  mes: number
  dia: number
  fusoHorario: string
  dataHoraUtc: string
}

const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO_HORARIO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZoneName: "longOffset",
})

function descreverInstante(agora: Date): DataHoraResponse {
  const partes = new Map(
    formatter
      .formatToParts(agora)
      .map((parte) => [parte.type, parte.value] as const),
  )

  const campo = (nome: Intl.DateTimeFormatPartTypes) => partes.get(nome) ?? ""

  const offset = campo("timeZoneName").replace("GMT", "") || "+00:00"

  const data = `${campo("year")}-${campo("month")}-${campo("day")}`
  const hora = `${campo("hour")}:${campo("minute")}:${campo("second")}`

  return {
    dataHora: `${data}T${hora}${offset}`,
    data,
    hora,
    ano: Number(campo("year")),
    mes: Number(campo("month")),
    dia: Number(campo("day")),
    fusoHorario: FUSO_HORARIO,
    dataHoraUtc: agora.toISOString(),
  }
}

export function registerDataHoraTool(server: McpServer) {
  server.registerTool(
    "data-hora",
    {
      description:
        "Retorna a data e a hora atuais no fuso de Brasília (America/Sao_Paulo). " +
        "Use antes de responder qualquer pergunta relativa ao momento presente " +
        "'hoje', 'ano passado', 'atualmente', 'último ano disponível' para saber " +
        "a que ano o usuário se refere, em vez de supor. " +
        "Atenção: o ano atual não é necessariamente o último período publicado de " +
        "uma pesquisa; para isso consulte os períodos do agregado.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async () => {
      const resultado = descreverInstante(new Date())

      return {
        content: [{ type: "text", text: JSON.stringify(resultado, null, 2) }],
      }
    },
  )
}
