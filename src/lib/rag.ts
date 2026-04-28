import path from 'path'
import fs from 'fs'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

type EmbeddingEntry = {
  text: string
  source: string
  embedding: number[]
}

let cached: EmbeddingEntry[] | null = null

function loadEmbeddings(): EmbeddingEntry[] {
  if (cached) return cached
  const file = path.join(process.cwd(), 'knowledge', 'embeddings.json')
  cached = JSON.parse(fs.readFileSync(file, 'utf-8'))
  return cached!
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

export async function retrieveContext(query: string, topK = 3): Promise<string> {
  const embeddings = loadEmbeddings()

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })
  const queryEmbedding = response.data[0].embedding

  const scored = embeddings.map((entry) => ({
    text: entry.text,
    score: cosineSimilarity(queryEmbedding, entry.embedding),
  }))

  scored.sort((a, b) => b.score - a.score)

  return scored
    .slice(0, topK)
    .map((s) => s.text)
    .join('\n\n---\n\n')
}
