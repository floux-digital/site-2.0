const ATTIO_BASE = 'https://api.attio.com/v2'

type AttioHeaders = {
  Authorization: string
  'Content-Type': string
}

function headers(): AttioHeaders {
  return {
    Authorization: `Bearer ${process.env.ATTIO_API_KEY}`,
    'Content-Type': 'application/json',
  }
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

async function findOrCreatePerson(params: {
  name: string
  email?: string
  phone?: string
}): Promise<string> {
  const identifier = params.email || params.phone
  if (!identifier) throw new Error('Email ou telefone é necessário')

  if (params.email) {
    const query = await attioFetch('/objects/people/records/query', {
      method: 'POST',
      body: JSON.stringify({
        filter: { email_addresses: { email_address: { '$eq': params.email } } },
        limit: 1,
      }),
    })
    if (query.data?.length > 0) {
      return query.data[0].id.record_id
    }
  }

  const values: Record<string, unknown[]> = {
    name: [{ full_name: params.name }],
  }
  if (params.email) {
    values.email_addresses = [{ email_address: params.email }]
  }
  if (params.phone) {
    values.phone_numbers = [{ phone_number: params.phone }]
  }

  const created = await attioFetch('/objects/people/records', {
    method: 'POST',
    body: JSON.stringify({ data: { values } }),
  })
  return created.data.id.record_id
}

async function findOrCreateCompany(name: string): Promise<string | null> {
  try {
    const query = await attioFetch('/objects/companies/records/query', {
      method: 'POST',
      body: JSON.stringify({
        filter: { name: { '$eq': name } },
        limit: 1,
      }),
    })
    if (query.data?.length > 0) return query.data[0].id.record_id

    const created = await attioFetch('/objects/companies/records', {
      method: 'POST',
      body: JSON.stringify({ data: { values: { name: [{ value: name }] } } }),
    })
    return created.data.id.record_id
  } catch {
    return null
  }
}

async function addToVendasList(personId: string, listId: string) {
  await attioFetch(`/lists/${listId}/entries`, {
    method: 'POST',
    body: JSON.stringify({
      data: {
        record_reference: {
          target_object: 'people',
          target_record_id: personId,
        },
        values: {},
      },
    }),
  })
}

async function createNote(personId: string, summary: string) {
  await attioFetch('/notes', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        parent_object: 'people',
        parent_record_id: personId,
        title: 'Conversa no site Floux',
        content_plaintext: summary,
      },
    }),
  })
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

export async function saveLead(data: LeadData): Promise<void> {
  const [personId, listId] = await Promise.all([
    findOrCreatePerson({ name: data.nome, email: data.email, phone: data.telefone }),
    getVendasListId(),
  ])

  const tasks: Promise<unknown>[] = [
    addToVendasList(personId, listId),
    createNote(personId, buildNoteContent(data)),
  ]

  if (data.empresa) {
    tasks.push(findOrCreateCompany(data.empresa))
  }

  await Promise.all(tasks)
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
