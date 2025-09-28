import axios from "axios";
import env from "@/env";
import { Pesquisa, PesquisaResponse } from "@/types/ibge";

export const pesquisasTool = {
  name: "pesquisas",
  description: "Busca pesquisas do IBGE",
  execute: async (): Promise<string> => {
    const response = await axios.get<Pesquisa[]>(env.IBGE_API);

    const pesquisas: PesquisaResponse[] = response.data.map((pesquisa) => {
      return {
        pesquisaId: pesquisa.id,
        nome: pesquisa.nome
      }
    });

    return JSON.stringify(pesquisas, null, 2);
  },
};
