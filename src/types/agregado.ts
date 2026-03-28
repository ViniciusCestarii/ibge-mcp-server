export type Pesquisa = {
  id: string;
  nome: string;
  agregados: Agregado[];
}

export type Agregado = {
  id: string;
  nome: string;
}

export type AgregadoMetadados = {
  id: number;
  nome: string;
  URL: string;
  pesquisa: string;
  assunto: string;
  periodicidade: {
    frequencia: string;
    inicio: number;
    fim: number;
  };
  nivelTerritorial: {
    Administrativo: string[];
    Especial: string[];
    IBGE: string[];
  };
  variaveis: {
    id: number;
    nome: string;
    unidade: string;
    sumarizacao: string[];
  }[];
  classificacoes: any[];
}

export type PesquisaResponse = {
  pesquisaId: string;
  nome: string;
}

export type AgregadoResponse = {
  agregadoId: string;
  nome: string;
}

export type AgregadoMetadadosResponse = {
  agregadoId: number;
  nome: string;
  pesquisa: string;
  assunto: string;
  periodicidade: {
    frequencia: string;
    inicio: number;
    fim: number;
  };
  nivelTerritorial: {
    Administrativo: string[];
    Especial: string[];
    IBGE: string[];
  };
  variaveis: {
    variavelId: number;
    nome: string;
    unidade: string;
    sumarizacao: string[];
  }[];
  classificacoes: any[];
}
