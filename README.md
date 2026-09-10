# IBGE MCP Server

Servidor MCP que expõe as APIs públicas do IBGE (agregados e localidades) como ferramentas para agentes de IA.

## Ferramentas

| Ferramenta            | Descrição                                                          |
| --------------------- | ------------------------------------------------------------------ |
| `pesquisas`           | Lista as pesquisas do IBGE                                         |
| `agregados`           | Lista os agregados de uma pesquisa                                 |
| `agregado-metadados`  | Variáveis, níveis territoriais e períodos de um agregado           |
| `agregado-dados`      | Busca os dados de um agregado                                      |
| `localidades`         | Descobre o id de um estado ou cidade                               |
| `data-hora`           | Data e hora atuais no fuso de Brasília                             |

## Requisitos

- Node.js 20+

## Instalação

Como pacote publicado no npm:

```bash
npx ibge-mcp-server
```

Para desenvolver localmente:

```bash
npm install
```

## Uso

Desenvolvimento:

```bash
npm run dev
```

Produção:

```bash
npm run build
npm start
```

Inspecionar as ferramentas no MCP Inspector:

```bash
npm run inspect
```

## Configuração

Crie um arquivo `.env` na raiz do projeto. Todas as variáveis são opcionais e têm valores padrão:

| Variável                | Padrão                                                  |
| ----------------------- | ------------------------------------------------------- |
| `TRANSPORT_TYPE`        | `stdio` (ou `httpStream`)                                |
| `PORT`                  | `3000` (usado apenas com `httpStream`)                   |
| `IBGE_API_AGREGADOS`    | `https://servicodados.ibge.gov.br/api/v3/agregados`      |
| `IBGE_API_LOCALIDADES`  | `https://servicodados.ibge.gov.br/api/v1/localidades`    |

## Conectando a um cliente MCP

```json
{
  "mcpServers": {
    "ibge": {
      "command": "npx",
      "args": ["-y", "ibge-mcp-server"]
    }
  }
}
```

Usando o código local:

```json
{
  "mcpServers": {
    "ibge": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "cwd": "/caminho/para/ibge-mcp-server"
    }
  }
}
```

## Docker

Build da imagem:

```bash
docker build -t ibge-mcp-server .
```

Executar (transporte `stdio`, precisa de `-i` para o MCP funcionar):

```bash
docker run -i --rm ibge-mcp-server
```

Passando variáveis de ambiente (ex.: `httpStream`):

```bash
docker run -i --rm -p 3000:3000 -e TRANSPORT_TYPE=httpStream -e PORT=3000 ibge-mcp-server
```

Usando no cliente MCP:

```json
{
  "mcpServers": {
    "ibge": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "ibge-mcp-server"]
    }
  }
}
```

## Testes

Os testes são avaliações que rodam um agente real contra o servidor e comparam a resposta com o resultado esperado. Eles usam um `.env` próprio: copie `test/.env.test.example` para `test/.env.test` e preencha as chaves.

```bash
npm test                  # runner padrão definido em TEST_RUNNER
npm run test:gemini       # usa a API do Gemini
npm run test:claude-code  # usa o Claude Agent SDK
```

## Outros comandos

```bash
npm run lint
npm run format
```

## Licença

[MIT](LICENSE)
