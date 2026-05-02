// Run:
// $ npx tsx --env-file=.env.local scripts/test-attio.ts

import { saveLead, LeadData } from '../src/lib/attio'

async function test() {
  const testData: LeadData = {
    nome: 'Teste Antigravity ' + new Date().toISOString(),
    email: 'teste@exemplo.com',
    telefone: '+5511999999999',
    empresa: 'Empresa Teste SA',
    tamanho_time: '10-50',
    interesse: 'Consultoria de Design e UX',
    urgencia: 'Alta',
    resumo_conversa: 'Esta é uma conversa de teste para validar a integração com o Attio após as correções de estrutura.'
  }

  console.log('🚀 Iniciando teste do Attio...')
  console.log('Dados do teste:', JSON.stringify(testData, null, 2))

  try {
    await saveLead(testData)
    console.log('✅ Teste concluído com sucesso! Lead salvo no Attio.')
  }
  catch (error) {

    console.error('❌ Erro no teste do Attio:', error)

    if (error instanceof Error) {
      console.error('Detalhes:', error.message)
    }
    process.exit(1)
  }
}

test()
