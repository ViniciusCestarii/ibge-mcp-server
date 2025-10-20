import axios from "axios";
import env from "@/env";
import { Regiao, RegiaoResponse } from "@/types/localidades.js";

export const regioesTool = {
  name: "regioes",
  description: "Busca regiões do Brasil junto com seu id",
  execute: async (): Promise<string> => {
    const response = await axios.get<Regiao[]>(`${env.IBGE_API_LOCALIDADES}/regioes`);

    const regioes: Regiao[] = response.data;


    const regioesResponse: RegiaoResponse[] = regioes.map((regiao) => regiao)

    return JSON.stringify(regioesResponse, null, 2);
  },
};
