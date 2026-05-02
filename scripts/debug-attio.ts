const ATTIO_BASE = 'https://api.attio.com/v2'

async function attioFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${ATTIO_BASE}${path}`, {
    ...options,
    headers: { 
        Authorization: `Bearer ${process.env.ATTIO_API_KEY}`,
        'Content-Type': 'application/json',
        ...(options.headers ?? {}) 
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Attio ${options.method ?? 'GET'} ${path} → ${res.status}: ${body}`)
  }
  return res.json()
}

async function debug() {
  try {
    const data = await attioFetch('/lists')
    console.log('--- Listas Disponíveis ---')
    for (const list of data.data) {
        console.log(`Nome: ${list.name}`)
        console.log(`ID: ${list.id.list_id}`)
        
        // Fetch detailed list config
        const detailed = await attioFetch(`/lists/${list.id.list_id}`)
        console.log('Full List Config:', JSON.stringify(detailed.data, null, 2))
        console.log('---------------------------')
    }

  } catch (error) {
    console.error('Erro no debug:', error)
  }
}

debug()
