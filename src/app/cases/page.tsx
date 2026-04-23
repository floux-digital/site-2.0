import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cases } from '@/lib/data'
import { webPageSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Cases',
  description:
    'Projetos realizados pela Floux para empresas como Santander e HauzForYou. Design strategy e produto em ação.',
  alternates: { canonical: 'https://floux.com.br/cases' },
  openGraph: { url: 'https://floux.com.br/cases', title: 'Cases | Floux' },
}

export default function CasesPage() {
  const jsonLd = webPageSchema({
    title: 'Cases da Floux',
    description: 'Foi alguém de nós que fez.',
    url: 'https://floux.com.br/cases',
    breadcrumbs: [
      { name: 'Início', url: 'https://floux.com.br' },
      { name: 'Cases', url: 'https://floux.com.br/cases' },
    ],
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ── */}
      <section className="min-h-[60vh] flex flex-col justify-center px-4 lg:px-6 py-20 lg:py-32">
        <h1 className="text-[3rem] sm:text-[5rem] lg:text-display font-light leading-display tracking-display text-black max-w-[1100px]">
          Foi alguém de nós que fez
        </h1>
      </section>

      {/* ── Cases list ── */}
      <section className="px-4 lg:px-6 pb-20 flex flex-col gap-20">
        {cases.map((c) => (
          <article key={c.slug} className="flex flex-col gap-4">
            {/* Cover image */}
            <div className="w-full aspect-[16/7] rounded-3xl bg-card overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[1.5rem] lg:text-[2rem] font-light">{c.title}</h2>
                <p className="text-[16px] font-normal text-muted mt-1">{c.client}</p>
              </div>
              <Link
                href={`/cases/${c.slug}`}
                className="inline-flex items-center gap-3 bg-black text-white font-medium text-[16px] pl-5 pr-1 py-1 rounded-full hover:opacity-80 transition-opacity shrink-0 ml-4"
                aria-label={`Ver detalhes de ${c.title}`}
              >
                <span>Detalhes</span>
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-accent">
                  <ArrowUpRight size={16} strokeWidth={2} className="text-black" />
                </span>
              </Link>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
