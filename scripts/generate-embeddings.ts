import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge')
const OUTPUT_FILE = path.join(KNOWLEDGE_DIR, 'embeddings.json')
const CHUNK_SIZE = 1200 // ~300 tokens

function chunkText(text: string, source: string): { text: string; source: string }[] {
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
  const chunks: { text: string; source: string }[] = []
  let current = ''

  for (const paragraph of paragraphs) {
    if ((current + '\n\n' + paragraph).length > CHUNK_SIZE && current) {
      chunks.push({ text: current.trim(), source })
      current = paragraph
    } else {
      current = current ? current + '\n\n' + paragraph : paragraph
    }
  }

  if (current.trim()) {
    chunks.push({ text: current.trim(), source })
  }

  return chunks
}

async function main() {
  const files = fs.readdirSync(KNOWLEDGE_DIR).filter((f) => f.endsWith('.md'))
  const allChunks: { text: string; source: string }[] = []

  for (const file of files) {
    const content = fs.readFileSync(path.join(KNOWLEDGE_DIR, file), 'utf-8')
    const chunks = chunkText(content, file)
    allChunks.push(...chunks)
    console.log(`${file}: ${chunks.length} chunks`)
  }

  console.log(`\nGenerating embeddings for ${allChunks.length} chunks...`)

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: allChunks.map((c) => c.text),
  })

  const result = allChunks.map((chunk, i) => ({
    text: chunk.text,
    source: chunk.source,
    embedding: response.data[i].embedding,
  }))

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2))
  console.log(`\nSaved ${result.length} embeddings to ${OUTPUT_FILE}`)
}

main().catch(console.error)
