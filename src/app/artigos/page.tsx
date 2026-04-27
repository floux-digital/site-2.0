import type { Metadata } from 'next'
import Link from 'next/link'
import DesktopSidebar from '@/components/layout/DesktopSidebar'
import FlImage from '@/components/ui/FlImage'
import { getAllArticles, formatDate } from '@/lib/artigos'
import { webPageSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Artigos',
  description: 'Reflexões sobre design, produto e tecnologia para negócios que querem crescer com consistência.',
  alternates: { canonical: 'https://floux.com.br/artigos' },
  openGraph: { url: 'https://floux.com.br/artigos', title: 'Artigos | Floux' },
}

export default function ArtigosPage() {
  const articles = getAllArticles()

  const jsonLd = webPageSchema({
    title: 'Artigos — Floux',
    description: 'Reflexões sobre design, produto e tecnologia para negócios que querem crescer com consistência.',
    url: 'https://floux.com.br/artigos',
    breadcrumbs: [
      { name: 'Início', url: 'https://floux.com.br' },
      { name: 'Artigos', url: 'https://floux.com.br/artigos' },
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
          
          <div className="flex-1 flex flex-col gap-[44px]">
            <div className="pb-[44px]">
              <h1 className="max-w-[800px]">Artigos</h1>
            </div>

            <p className="max-w-[340px]">
             Confira nossos estudos e opiniões sobre tendências e profissão
            </p>
          </div>

        </div>
      </section>

      {/* ── Article list ── */}
      <section className="padding-x pb-[88px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />

          <div className="flex-1 max-w-[900px]">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/artigos/${article.slug}`}
                className="group flex gap-6 items-start py-10 border-b border-black/25 hover:opacity-80 transition-opacity"
              >
                {/* Text */}
                <div className="flex-1 flex flex-col gap-[22px] py-1">
                  <h4 className="!leading-[1.5]">{article.title}</h4>
                  
                  <p className="!leading-[1.5]">
                    {article.resume.length > 80 ? article.resume.slice(0, 80) + '…' : article.resume}
                  </p>
                  <span className="!text-sm text-muted">{formatDate(article.date)}</span>
                </div>

                {/* Thumbnail */}
                <div className="relative w-[140px] h-[160px] lg:w-[187px] lg:h-[200px] rounded-[22px] overflow-hidden shrink-0">
                  <FlImage
                    src={article.image || undefined}
                    alt={article.title}
                    fill
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
