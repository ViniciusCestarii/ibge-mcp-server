# IBGE MCP Server

Servidor MCP que expõe as APIs públicas do IBGE (agregados e localidades) como ferramentas para agentes de IA.

## Começando

A forma mais fácil e gratuita de começar é conectar o servidor hospedado (https://ibge-mcp.viniciuscestari.dev/) ao [claude.ai](https://claude.ai):

https://github.com/user-attachments/assets/9188823a-a72e-408b-88d4-7bbdb148333a

```json
{
  "mcpServers": {
    "ibge": {
      "url": "https://ibge-mcp.viniciuscestari.dev/"
    }
  }
}
```

### Compatibilidade

| App                     | Como conectar                                                        |
| ----------------------- | -------------------------------------------------------------------- |
| Claude (web e desktop)  | De graça, é o caminho recomendado acima (o plano Free permite apenas um conector personalizado) |
| ChatGPT (só na web)     | Só em planos pagos (Plus, Pro, Business, Enterprise ou Edu), ativando o modo desenvolvedor em Configurações > Apps e conectores; em Business e Enterprise o admin precisa liberar |
| Gemini (app)            | Só pelo Gemini Spark (conta pessoal, plano AI Pro ou Ultra); fora disso, use o Gemini CLI |
| Gemini CLI              | No `mcpServers` do `~/.gemini/settings.json` (ou `.gemini/settings.json` do projeto) |
| Cursor                  | Em Settings > Tools & MCP (ou no `.cursor/mcp.json` do projeto)       |
| VS Code (Copilot)       | Em modo agente, com `mcp.json`no workspace ou no perfil, leia: https://code.visualstudio.com/docs/copilot/customization/mcp-servers |
| Outros clientes MCP     | Por URL (servidor hospedado) ou rodando localmente                    |

Dica: pergunte para sua LLM como fazer caso tenha dúvidas.

### Rodando localmente

Em vez do servidor hospedado, é possível rodar na sua própria máquina:

- Via `npx`, sem instalar nada: [Conectando a um cliente MCP](#conectando-a-um-cliente-mcp)
- Via container: [Docker](#docker)
- A partir do código: [Instalação](#instalação) e depois [Usando o código local](#conectando-a-um-cliente-mcp)

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

Usando direto do npm registry:

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

Usando servidor hospedado:

```json
{
  "mcpServers": {
    "ibge": {
      "url": "https://ibge-mcp.viniciuscestari.dev/"
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
