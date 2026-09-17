export type Regiao = {
  id: number
  sigla: string
  nome: string
}

export type Estado = {
  id: number
  sigla: string
  nome: string
  regiao: Regiao
}

export type Municipio = {
  id: number
  nome: string
  microrregiao: {
    id: number
    nome: string
    mesorregiao: {
      id: number
      nome: string
      UF: Estado
    }
  } | null
  "regiao-imediata": {
    id: number
    nome: string
    "regiao-intermediaria": {
      id: number
      nome: string
      UF: Estado
    }
  } | null
}

export type EstadoResponse = {
  localidadeId: number
  sigla: string
  nome: string
  regiao: string
}

export type MunicipioResponse = {
  localidadeId: number
  nome: string
  estado: {
    localidadeId: number
    sigla: string
    nome: string
  }
}
