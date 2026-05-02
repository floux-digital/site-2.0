const ATTIO_BASE = 'https://api.attio.com/v2'

type AttioHeaders = {
  Authorization: string
  'Content-Type': string
}

export type LeadData = {
  nome: string
  email?: string
  telefone?: string
  empresa?: string
  tamanho_time?: string
  interesse?: string
  urgencia?: string
  resumo_conversa: string
}

function headers(): AttioHeaders {
  return {
    Authorization: `Bearer ${process.env.ATTIO_API_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function addToVendasList(recordId: string, listId: string, objectSlug: string = 'people') {
  await attioFetch(`/lists/${listId}/entries`, {
    method: 'POST',
    body: JSON.stringify({
      data: {
        parent_object: objectSlug,
        parent_record_id: recordId,
        entry_values: {},
      },
    }),
  })
}


async function attioFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${ATTIO_BASE}${path}`, {
    ...options,
    headers: { ...headers(), ...(options.headers ?? {}) },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Attio ${options.method ?? 'GET'} ${path} → ${res.status}: ${body}`)
  }
  return res.json()
}

async function getVendasListId(): Promise<string> {
  const data = await attioFetch('/lists')
  const list = data.data.find(
    (l: { name: string; id: { list_id: string } }) =>
      l.name.toLowerCase() === 'vendas'
  )
  if (!list) throw new Error('Lista "Vendas" não encontrada no Attio')
  return list.id.list_id
}

function parseName(name: string) {
  const parts = name.trim().split(/\s+/)
  const first_name = parts[0] || ''
  const last_name = parts.length > 1 ? parts.slice(1).join(' ') : '-'
  return {
    first_name,
    last_name,
    full_name: name,
  }
}

async function findOrCreatePerson(params: {
  name: string
  email?: string
  phone?: string
  companyId?: string
}): Promise<string> {
  if (!params.email && !params.phone) {
    throw new Error('Email ou telefone é necessário')
  }

  // Use Assert (upsert) em vez de query+create — evita race conditions
  // e respeita a unicidade de email_addresses
  if (params.email) {
    const values: Record<string, unknown> = {
      name: [parseName(params.name)],
      email_addresses: [{ email_address: params.email }],
    }
    if (params.phone) {
      values.phone_numbers = [{ original_phone_number: params.phone }]
    }
    if (params.companyId) {
      values.company = [{ target_object: 'companies', target_record_id: params.companyId }]
    }

    const asserted = await attioFetch(
      '/objects/people/records?matching_attribute=email_addresses',
      { method: 'PUT', body: JSON.stringify({ data: { values } }) }
    )
    return asserted.data.id.record_id
  }

  // Sem email: criar direto
  const values: Record<string, unknown> = {
    name: [parseName(params.name)],
    phone_numbers: [{ original_phone_number: params.phone! }],
  }
  if (params.companyId) {
    values.company = [{ target_object: 'companies', target_record_id: params.companyId }]
  }
  const created = await attioFetch('/objects/people/records', {
    method: 'POST',
    body: JSON.stringify({ data: { values } }),
  })
  return created.data.id.record_id
}

async function findOrCreateCompany(name: string): Promise<string | null> {
  // 'name' em companies é Text simples — passe string
  try {
    const query = await attioFetch('/objects/companies/records/query', {
      method: 'POST',
      body: JSON.stringify({ filter: { name: { '$eq': name } }, limit: 1 }),
    })
    if (query.data?.length > 0) return query.data[0].id.record_id

    const created = await attioFetch('/objects/companies/records', {
      method: 'POST',
      body: JSON.stringify({ data: { values: { name } } }),
    })
    return created.data.id.record_id
  } catch {
    return null
  }
}

export async function saveLead(data: LeadData): Promise<void> {
  // 1) Resolva company PRIMEIRO para vincular à pessoa
  const [companyId, listId] = await Promise.all([
    data.empresa ? findOrCreateCompany(data.empresa) : Promise.resolve(null),
    getVendasListId(),
  ])

  // 2) Crie/atualize pessoa já com a company vinculada
  const personId = await findOrCreatePerson({
    name: data.nome,
    email: data.email,
    phone: data.telefone,
    companyId: companyId ?? undefined,
  })

  // 3) Lista + nota em paralelo
  // Se a lista "Vendas" for de companies (comum em CRMs), adicione a company. 
  // Se não tiver company ou a lista for de pessoas, o addToVendasList lidará com o ID correto.
  const targetId = companyId || personId
  const targetObject = companyId ? 'companies' : 'people'

  await Promise.all([
    addToVendasList(targetId, listId, targetObject),
    createNote(personId, buildNoteContent(data)),
  ])
}

function buildNoteContent(data: LeadData): string {
  const lines = [
    `Nome: ${data.nome}`,
    data.email ? `Email: ${data.email}` : null,
    data.telefone ? `Telefone: ${data.telefone}` : null,
    data.empresa ? `Empresa: ${data.empresa}` : null,
    data.tamanho_time ? `Tamanho do time: ${data.tamanho_time}` : null,
    data.interesse ? `Interesse: ${data.interesse}` : null,
    data.urgencia ? `Urgência: ${data.urgencia}` : null,
    '',
    'Resumo da conversa:',
    data.resumo_conversa,
  ].filter((l) => l !== null)

  return lines.join('\n')
}

async function createNote(personId: string, summary: string) {
  await attioFetch('/notes', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        parent_object: 'people',
        parent_record_id: personId,
        title: 'Conversa no site Floux',
        format: 'plaintext',
        content: summary,
      },
    }),
  })
}