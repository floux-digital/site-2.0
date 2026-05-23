export type LeadData = {
  nome: string
  email?: string
  telefone?: string
  empresa?: string
  tamanho_time?: string
  interesse?: string
  urgencia?: string
  resumo_conversa: string
  qualificacao: 'MQL' | 'SQL' | 'NQL'
}

const STAGE_MAP: Record<string, string> = {
  MQL: 'appointmentscheduled',
  SQL: 'qualifiedtobuy',
  NQL: '1352166560',
}

const HUBSPOT_BASE = 'https://api.hubapi.com'

async function hubspotFetch(path: string, options: RequestInit = {}) {
  // Use the 2026-03 version for CRM objects if not specified otherwise
  const fullPath = path.startsWith('/oauth') ? path : `/crm/objects/2026-03${path}`

  const res = await fetch(`${HUBSPOT_BASE}${fullPath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HubSpot ${options.method ?? 'GET'} ${fullPath} → ${res.status}: ${body}`)
  }

  if (res.status === 204) return null
  return res.json()
}

function parseName(name: string) {
  const parts = name.trim().split(/\s+/)
  const firstName = parts[0] || ''
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : ''
  return { firstName, lastName }
}

export async function saveLeadHubSpot(data: LeadData): Promise<void> {
  const { firstName, lastName } = parseName(data.nome)

  // 1. Upsert Contact
  let contactId: string

  if (data.email) {
    const upsertResponse = await hubspotFetch('/contacts/batch/upsert', {
      method: 'POST',
      body: JSON.stringify({
        inputs: [
          {
            id: data.email,
            idProperty: 'email',
            properties: {
              email: data.email,
              firstname: firstName,
              lastname: lastName,
              phone: data.telefone,
              company: data.empresa,
            }
          }
        ]
      })
    })
    contactId = upsertResponse.results[0].id
  } else {
    const createResponse = await hubspotFetch('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        properties: {
          firstname: firstName,
          lastname: lastName,
          phone: data.telefone,
          company: data.empresa,
        }
      })
    })
    contactId = createResponse.id
  }

  // 2. Create Deal and Associate with Contact
  const dealStage = STAGE_MAP[data.qualificacao] || 'appointmentscheduled'
  await hubspotFetch('/deals', {
    method: 'POST',
    body: JSON.stringify({
      properties: {
        dealname: `Lead: ${data.nome} (${data.qualificacao})`,
        dealstage: dealStage,
        pipeline: 'default',
        amount: data.qualificacao === 'SQL' ? '1000' : '0', // Optional: just a placeholder
      },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 3 // Deal to Contact
            }
          ]
        }
      ]
    })
  })

  // 3. Create Note and Associate with Contact
  const noteContent = buildNoteContent(data)
  await hubspotFetch('/notes', {
    method: 'POST',
    body: JSON.stringify({
      properties: {
        hs_note_body: noteContent,
        hs_timestamp: new Date().toISOString(),
      },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 202 // Note to Contact
            }
          ]
        }
      ]
    })
  })
}

function buildNoteContent(data: LeadData): string {
  const lines = [
    `<b>Conversa no site Floux</b>`,
    `<br/>`,
    `<b>Nome:</b> ${data.nome}`,
    data.email ? `<b>Email:</b> ${data.email}` : null,
    data.telefone ? `<b>Telefone:</b> ${data.telefone}` : null,
    data.empresa ? `<b>Empresa:</b> ${data.empresa}` : null,
    data.tamanho_time ? `<b>Tamanho do time:</b> ${data.tamanho_time}` : null,
    data.interesse ? `<b>Interesse:</b> ${data.interesse}` : null,
    data.urgencia ? `<b>Urgência:</b> ${data.urgencia}` : null,
    `<br/>`,
    `<b>Resumo da conversa:</b>`,
    data.resumo_conversa.replace(/\n/g, '<br/>'),
  ].filter((l) => l !== null)

  return lines.join('<br/>')
}
