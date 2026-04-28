import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { retrieveContext } from '@/lib/rag'
import { saveLead, type LeadData } from '@/lib/attio'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'save_lead',
      description:
        'Salva os dados do visitante no CRM. Chame quando tiver nome + (email OU telefone), independente dos outros campos.',
      parameters: {
        type: 'object',
        required: ['nome', 'resumo_conversa'],
        properties: {
          nome: { type: 'string', description: 'Nome completo do visitante' },
          email: { type: 'string', description: 'Email do visitante' },
          telefone: { type: 'string', description: 'Telefone do visitante' },
          empresa: { type: 'string', description: 'Empresa onde trabalha' },
          tamanho_time: { type: 'string', description: 'Tamanho do time (ex: 1-10, 11-50, 50+)' },
          interesse: { type: 'string', description: 'Principal interesse ou necessidade' },
          urgencia: { type: 'string', description: 'Urgência da decisão (ex: imediato, 1-3 meses, explorando)' },
          resumo_conversa: { type: 'string', description: 'Resumo do que foi conversado' },
        },
      },
    },
  },
]

type ClientMessage = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  const { messages }: { messages: ClientMessage[] } = await req.json()

  const lastUserMessage = messages.findLast((m) => m.role === 'user')?.content ?? ''
  const context = await retrieveContext(lastUserMessage)

  const systemPrompt = `Você é um assistente virtual da Floux, uma consultoria de design e tecnologia para negócios.

Seu objetivo é:
1. Responder dúvidas sobre a Floux de forma clara e objetiva
2. Qualificar visitantes coletando: nome, contato (telefone ou email), empresa, tamanho do time, interesse principal e urgência da decisão
3. Ser natural e conversacional — nunca pareça um formulário

CONTEXTO RELEVANTE SOBRE A FLOUX:
${context}

REGRAS DE COLETA:
- Colete os dados naturalmente ao longo da conversa, nunca todos de uma vez
- Mínimo para salvar: nome + (telefone OU email)
- Completo: nome + contato + empresa + tamanho do time + interesse + urgência
- Use a ferramenta save_lead quando:
  a) Todos os dados foram coletados
  b) O usuário sinalizar que não quer fornecer mais dados, mas você já tem nome + (tel ou email)
- Se o usuário não quiser deixar sequer um contato ou nome, agradeça e encerre educadamente

REGRAS GERAIS:
- Responda sempre em português brasileiro
- Seja cordial, direto e profissional
- Não invente informações sobre a Floux que não estejam no contexto
- Se não souber responder algo, diga que um especialista da equipe pode ajudar melhor`

  const openAiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ]

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: openAiMessages,
    tools: TOOLS,
    tool_choice: 'auto',
  })

  const choice = completion.choices[0]

  if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
    const toolCall = choice.message.tool_calls[0]

    if (toolCall.type === 'function' && toolCall.function.name === 'save_lead') {
      const leadData: LeadData = JSON.parse(toolCall.function.arguments)
      let saveError: string | null = null

      try {
        await saveLead(leadData)
      } catch (err) {
        saveError = err instanceof Error ? err.message : String(err)
        console.error('Attio save failed:', saveError)
      }

      const followUp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          ...openAiMessages,
          choice.message,
          {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: saveError
              ? JSON.stringify({ success: false, error: saveError })
              : JSON.stringify({ success: true }),
          },
        ],
      })

      return Response.json({
        message: followUp.choices[0].message.content,
        leadSaved: !saveError,
      })
    }
  }

  return Response.json({
    message: choice.message.content,
    leadSaved: false,
  })
}
