import axios from "axios";
import env from "@/env";
import { z } from "zod";
import { AgregadoMetadados, AgregadoMetadadosResponse } from "@/types/agregado";

export const agregadoMetadadoTool = {
  name: "agregado-metadados",
  description: "Busca metadados (variáveis, nivelTerritorial, periodicidade, etc.) de um agregado por agregadoId",
  parameters: z.object({
    agregadoId: z.string()
  }),
  execute: async (args: {agregadoId: string}): Promise<string> => {
    const response = await axios.get<AgregadoMetadados>(`${env.IBGE_API_AGREGADOS}/${args.agregadoId}/metadados`);

    const data = response.data;

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
        sumarizacao: variavel.sumarizacao
      })),
      classificacoes: data.classificacoes
    }

    return JSON.stringify(agregadoMetadados, null, 2);
  },
};
