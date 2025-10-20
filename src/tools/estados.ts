import axios from "axios";
import env from "@/env";
import { Estado, EstadoResponse } from "@/types/localidades.js";

export const estadosTool = {
  name: "estados",
  description: "Busca estados do Brasil junto com seu id",
  execute: async (): Promise<string> => {
    const response = await axios.get<Estado[]>(`${env.IBGE_API_LOCALIDADES}/estados`);

    const estados: Estado[] = response.data;


    const estadosResponse: EstadoResponse[] = estados.map((estado) => estado)

    return JSON.stringify(estadosResponse, null, 2);
  },
};
