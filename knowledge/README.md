# Chat IA — Documentação operacional

## Visão geral

O chat usa um agente OpenAI (gpt-4o-mini) com RAG (Retrieval Augmented Generation) para responder dúvidas sobre a Floux e qualificar leads. Quando o agente coleta dados suficientes, salva automaticamente no CRM Attio (lista "Vendas").

---

## Variáveis de ambiente necessárias

No arquivo `.env.local`:

```
OPENAI_API_KEY=sk-...
ATTIO_API_KEY=...
```

---

## Base de conhecimento (RAG)

O conteúdo que o agente conhece sobre a Floux fica em arquivos `.md` dentro de `/knowledge/`.

### Estrutura atual

```
knowledge/
  floux.md          ← conteúdo sobre a Floux (edite aqui)
  embeddings.json   ← gerado automaticamente, não edite manualmente
  README.md         ← este arquivo
```

### Como atualizar o conteúdo

1. Edite ou adicione arquivos `.md` em `/knowledge/`
2. Rode o script de embeddings:

```bash
npm run embeddings
```

3. Faça o deploy normalmente. O `embeddings.json` atualizado precisa ir junto.

> O script lê todos os `.md` da pasta, divide em chunks de ~1200 caracteres e gera embeddings via `text-embedding-3-small`. Custo estimado: menos de $0,01 para um knowledge base do tamanho típico da Floux.

### Boas práticas para o conteúdo

- Use headings `##` para separar seções — o chunking respeita parágrafos
- Seja específico: quanto mais preciso o conteúdo, melhores as respostas
- Seções recomendadas: O que é a Floux, Serviços, Para quem é, Como trabalhamos, Preços (se aplicável), FAQ, Contato

---

## Lógica de qualificação do agente

O agente coleta os seguintes dados ao longo da conversa:

| Campo | Obrigatório para salvar |
|---|---|
| Nome | Sim |
| Email OU Telefone | Sim (ao menos um) |
| Empresa | Não |
| Tamanho do time | Não |
| Interesse | Não |
| Urgência | Não |

**O agente salva no Attio quando:**
- Todos os dados foram coletados (qualificação completa), **ou**
- O usuário sinaliza que não quer fornecer mais dados, mas já tem nome + contato

**Se o usuário não fornecer nome ou contato**, o agente encerra educadamente sem salvar.

---

## O que é salvo no Attio

Para cada lead qualificado:

- **Person** — criado ou encontrado pelo email (deduplicado)
- **Company** — criada ou encontrada pelo nome (se fornecida)
- **List entry** — adicionado à lista "Vendas"
- **Note** — nota com todos os dados coletados e resumo da conversa

---

## System prompt e comportamento do agente

O system prompt fica em [`src/app/api/chat/route.ts`](../src/app/api/chat/route.ts). Para alterar o tom, as regras de coleta ou o comportamento do agente, edite a constante `systemPrompt` nesse arquivo.

A mensagem inicial do chat ("Para começar, como posso te chamar?") é pré-carregada no estado React e enviada como contexto ao agente. Para alterá-la, edite [`src/contexts/ChatContext.tsx`](../src/contexts/ChatContext.tsx).

---

## Modelo e custos estimados

| Operação | Modelo | Custo estimado |
|---|---|---|
| Resposta do chat | gpt-4o-mini | ~$0,0002 por conversa |
| Busca RAG (embedding da pergunta) | text-embedding-3-small | ~$0,000002 por mensagem |
| Geração de embeddings da base | text-embedding-3-small | ~$0,001 (único, no update) |

---

## Fluxo completo de uma conversa

```
Usuário abre o chat
  → Estado inicial: "Para começar, como posso te chamar?"

Usuário envia mensagem
  → POST /api/chat com histórico completo
  → Embedding da última mensagem → busca RAG → top 3 chunks
  → OpenAI gpt-4o-mini com system prompt + contexto relevante
  → Se agente chama save_lead → Attio API → Person + List + Note
  → Resposta retorna ao cliente
```

---

## Componentes do chat

| Arquivo | Responsabilidade |
|---|---|
| `src/contexts/ChatContext.tsx` | Estado da conversa (persiste entre páginas na sessão, limpa ao fechar a aba) |
| `src/components/chat/ChatProvider.tsx` | Provider + renderiza Sheet |
| `src/components/chat/ChatSheet.tsx` | Bottom sheet (vaul) com teclado mobile via visualViewport |
| `src/components/chat/ChatMessages.tsx` | Lista de mensagens e estado inicial |
| `src/components/chat/ChatInput.tsx` | Input expansível + envio |
| `src/components/chat/ChatOpenButton.tsx` | Botão reutilizável para abrir o chat em qualquer lugar |
| `src/app/api/chat/route.ts` | API route: RAG + OpenAI + Attio |
| `src/lib/rag.ts` | Cosine similarity em memória |
| `src/lib/attio.ts` | Integração com Attio CRM |
| `scripts/generate-embeddings.ts` | Script de geração de embeddings |
