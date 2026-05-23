// Run:
// $ npx tsx --env-file=.env.local scripts/test-hubspot.ts

import { saveLeadHubSpot, LeadData } from '../src/lib/hubspot'

async function test() {
  const testData: LeadData = {
    nome: 'Teste HubSpot ' + new Date().toISOString(),
    email: 'hubspot-teste-' + Date.now() + '@exemplo.com',
    telefone: '+5511988888888',
    empresa: 'HubSpot Teste Corp',
    tamanho_time: '50-200',
    interesse: 'Implementação de CRM e Automação',
    urgencia: 'Média',
    resumo_conversa: 'Conversa de teste para validar a nova integração com o HubSpot.',
    qualificacao: 'SQL'
  }

  console.log('🚀 Iniciando teste do HubSpot...')
  console.log('Dados do teste:', JSON.stringify(testData, null, 2))

  try {
    await saveLeadHubSpot(testData)
    console.log('✅ Teste concluído com sucesso! Lead salvo no HubSpot.')
  }
  catch (error) {
    console.error('❌ Erro no teste do HubSpot:', error)
    if (error instanceof Error) {
      console.error('Detalhes:', error.message)
    }
    process.exit(1)
  }
}

test()
