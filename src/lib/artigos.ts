/**
 * artigos.ts — pipeline de leitura e render dos artigos do blog
 *
 * ─── ONDE FICAM OS ARQUIVOS ──────────────────────────────────────────────────
 *
 *   content/artigos/<slug>.md
 *
 *   O nome do arquivo vira o slug da URL: meu-artigo.md → /artigos/meu-artigo
 *   Use kebab-case sem acentos, ex: design-centrado-no-usuario.md
 *
 * ─── FRONTMATTER ─────────────────────────────────────────────────────────────
 *
 *   ---
 *   title: "Título completo do artigo"
 *   resume: "Resumo de até ~80 caracteres exibido na listagem e no hero."
 *   image: "/artigos/minha-capa.jpg"   # opcional — omitir se não houver imagem
 *   date: 2026-05-01                   # YYYY-MM-DD — ausente ou comentado = draft
 *   author: "Jeff Monteiro"            # nome exibido ao lado da data
 *   ---
 *
 *   Conteúdo em markdown...
 *
 * ─── DRAFT vs PUBLICADO ──────────────────────────────────────────────────────
 *
 *   • date presente  → publicado, aparece na listagem ordenado por data
 *   • date ausente   → draft, ignorado em build e em runtime
 *
 *   Para salvar um rascunho sem publicar, comente o campo:
 *   # date: 2026-05-01
 *
 * ─── MARKDOWN SUPORTADO ──────────────────────────────────────────────────────
 *
 *   Títulos          ## H2  /  ### H3
 *   Ênfase           **negrito**  /  _itálico_
 *   Listas           - item  /  1. item
 *   Links            [texto](url)
 *   Imagens          ![alt](url)   — renderizadas com border-radius e largura total
 *   Código inline    `código`
 *   Bloco de código  ``` linguagem
 *   Blockquote       > texto       — borda verde accent à esquerda
 *   Tabelas          GFM | col1 | col2 |
 *   Separador        ---
 *
 *   Os estilos do HTML gerado estão na classe .article-body em globals.css.
 *
 * ─── IMAGENS ─────────────────────────────────────────────────────────────────
 *
 *   Arquivos em public/artigos/foto.jpg → image: "/artigos/foto.jpg"
 *   URLs externas também funcionam.
 *
 * ─── PUBLICAR UM NOVO ARTIGO ─────────────────────────────────────────────────
 *
 *   1. Crie content/artigos/meu-artigo.md com frontmatter + conteúdo
 *   2. Adicione a data de publicação no frontmatter
 *   3. Faça deploy — generateStaticParams pré-renderiza a página automaticamente
 *
 * ─── FORÇAR REVALIDAÇÃO EM DEV ───────────────────────────────────────────────
 *
 *   O Next.js lê os arquivos a cada request em modo dev. Em produção, o
 *   conteúdo é gerado estaticamente no build — um novo artigo exige redeploy.
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const CONTENT_DIR = path.join(process.cwd(), 'content/artigos')

export type ArticleMeta = {
  slug: string
  title: string
  resume: string
  image: string
  date: string // YYYY-MM-DD
  author: string
}

export type Article = ArticleMeta & {
  content: string // HTML gerado pelo pipeline remark → rehype
}

/** gray-matter parseia `date: 2026-05-01` como Date object — normaliza para string YYYY-MM-DD. */
function normalizeDate(raw: unknown): string | null {
  if (!raw) return null
  if (raw instanceof Date) return raw.toISOString().split('T')[0]
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  return null
}

/** Formata uma data ISO (YYYY-MM-DD) para exibição em português: "Abril de 2026". */
export function formatDate(iso: string): string {
  const [year, month] = iso.split('-')
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return `${months[parseInt(month, 10) - 1]} de ${year}`
}

/**
 * Retorna todos os artigos publicados (com date), ordenados do mais recente ao mais antigo.
 * Drafts (sem date) são silenciosamente ignorados.
 * Seguro para Server Components — lê o sistema de arquivos diretamente.
 */
export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return []

  return fs
    .readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md'))
    .flatMap(filename => {
      const slug = filename.replace(/\.md$/, '')
      const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf-8')
      const { data } = matter(raw)
      const date = normalizeDate(data.date)
      if (!date) return [] // draft — sem data = não publicado
      return [{
        slug,
        title: String(data.title ?? ''),
        resume: String(data.resume ?? ''),
        image: String(data.image ?? ''),
        date,
        author: String(data.author ?? ''),
      }]
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Retorna um artigo publicado pelo slug, incluindo o conteúdo renderizado em HTML.
 * Retorna null se o arquivo não existir ou for draft.
 * Async porque o pipeline unified é assíncrono.
 */
export async function getArticle(slug: string): Promise<Article | null> {
  const filepath = path.join(CONTENT_DIR, `${slug}.md`)
  if (!fs.existsSync(filepath)) return null

  const raw = fs.readFileSync(filepath, 'utf-8')
  const { data, content } = matter(raw)
  const date = normalizeDate(data.date)
  if (!date) return null // draft

  const html = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(content)

  return {
    slug,
    title: String(data.title ?? ''),
    resume: String(data.resume ?? ''),
    image: String(data.image ?? ''),
    date,
    author: String(data.author ?? ''),
    content: String(html),
  }
}
