import type { Metadata } from 'next'
import Link from 'next/link'
import { webPageSchema } from '@/lib/schema'

type Params = { slug: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  return {
    title: 'Artigo',
    description: 'Artigo da Floux sobre design e tecnologia.',
    alternates: { canonical: `https://floux.com.br/artigos/${slug}` },
  }
}

export default async function ArtigoPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params

  const jsonLd = webPageSchema({
    title: 'Artigo',
    description: 'Artigo sobre design e tecnologia.',
    url: `https://floux.com.br/artigos/${slug}`,
    breadcrumbs: [
      { name: 'Início', url: 'https://floux.com.br' },
      { name: 'Artigo', url: `https://floux.com.br/artigos/${slug}` },
    ],
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ── */}
      <section className="px-4 lg:px-6 py-16 lg:py-24 max-w-[900px]">
        <p className="text-[16px] font-medium text-muted mb-4">
          <Link href="/" className="hover:text-black transition-colors">
            Início
          </Link>
        </p>
        <h1 className="mb-6">Artigo</h1>
        <h2 className="text-muted mb-4">Subtitle</h2>
        <p className="text-[18px] font-normal text-muted">Text body</p>
      </section>

      {/* ── Body ── */}
      <section className="px-4 lg:px-6 pb-20 max-w-[780px]">
        <p className="text-[18px] text-black/80">
          Conteúdo do artigo virá aqui. Este é um template para artigos da Floux.
        </p>
      </section>
    </>
  )
}
