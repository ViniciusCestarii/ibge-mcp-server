export type Regiao = {
  id: number;
  sigla: string;
  nome: string;
}

export type Estado = {
  id: number;
  sigla: string;
  nome: string;
  regiao: Regiao;
};

type UF = {
  id: number;
  sigla: string;
  nome: string;
  regiao: Regiao;
};

type Mesorregiao = {
  id: number;
  nome: string;
  UF: UF;
};

type Microrregiao = {
  id: number;
  nome: string;
  mesorregiao: Mesorregiao;
};

export type Municipio = {
  id: number;
  nome: string;
  microrregiao: Microrregiao;
};


export type RegiaoResponse = Regiao;

export type EstadoResponse = Estado;

export type MunicipioResponse = Omit<Municipio, "microrregiao">