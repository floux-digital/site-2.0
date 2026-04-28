import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DesktopSidebar from '@/components/layout/DesktopSidebar'
import FlImage from '@/components/ui/FlImage'
import { getAllArticles, getArticle, formatDate } from '@/lib/artigos'
import { webPageSchema } from '@/lib/schema'

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.resume,
    alternates: { canonical: `https://flouxdigital.com.br/artigos/${slug}` },
    openGraph: {
      url: `https://flouxdigital.com.br/artigos/${slug}`,
      title: `${article.title} | Floux`,
      description: article.resume,
      ...(article.image ? { images: [{ url: article.image }] } : {}),
    },
  }
}

export default async function ArtigoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const jsonLd = webPageSchema({
    title: `${article.title} — Floux`,
    description: article.resume,
    url: `https://flouxdigital.com.br/artigos/${slug}`,
    breadcrumbs: [
      { name: 'Início', url: 'https://flouxdigital.com.br' },
      { name: 'Artigos', url: 'https://flouxdigital.com.br/artigos' },
      { name: article.title, url: `https://flouxdigital.com.br/artigos/${slug}` },
    ],
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ── */}
      <section className="padding-x py-[66px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <DesktopSidebar />
          <div className="flex-1 flex flex-col gap-[22px] max-w-[800px]">
            
            <h1>{article.title}</h1>
            <p className="font-medium py-5">
              {formatDate(article.date)}{article.author && <span className="text-muted"> — {article.author}</span>}
            </p>
            <h4 className="text-muted !leading-[1.5]">
              {article.resume}
            </h4>
          </div>
        </div>
      </section>

      {/* ── Cover image (opcional) ── */}
      {article.image && (
        <section className="padding-x pb-[44px]">
          <div className="flex flex-col lg:flex-row lg:items-start">
            <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
            <div className="flex-1 max-w-[800px]">
              <FlImage src={article.image} alt={article.title} />
            </div>
          </div>
        </section>
      )}

      {/* ── Content ── */}
      <section className="padding-x pb-[88px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
          <div
            className="article-body flex-1 max-w-[800px]"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </section>
    </>
  )
}
