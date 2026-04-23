import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cases } from '@/lib/data'
import { webPageSchema } from '@/lib/schema'

export async function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const c = cases.find((c) => c.slug === slug)
  if (!c) return {}

  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: `https://floux.com.br/cases/${slug}` },
    openGraph: {
      url: `https://floux.com.br/cases/${slug}`,
      title: `${c.title} | Floux`,
    },
  }
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const c = cases.find((c) => c.slug === slug)
  if (!c) notFound()

  const otherCases = cases.filter((oc) => oc.slug !== slug)

  const jsonLd = webPageSchema({
    title: c.title,
    description: c.description,
    url: `https://floux.com.br/cases/${slug}`,
    breadcrumbs: [
      { name: 'Início', url: 'https://floux.com.br' },
      { name: 'Cases', url: 'https://floux.com.br/cases' },
      { name: c.title, url: `https://floux.com.br/cases/${slug}` },
    ],
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ── */}
      <section className="px-4 lg:px-6 py-16 lg:py-24">
        <p className="text-[16px] font-medium text-muted mb-4">
          <Link href="/cases" className="hover:text-black transition-colors">
            Cases
          </Link>
        </p>
        <h1 className="text-[2.5rem] sm:text-[4rem] lg:text-display font-light leading-display tracking-display text-black max-w-[1100px]">
          {c.title}
        </h1>
        <p className="text-[18px] font-normal text-muted mt-4">{c.client}</p>
      </section>

      {/* ── Cover image ── */}
      <section className="px-2 lg:px-4 pb-16">
        <div className="w-full aspect-[16/8] rounded-3xl bg-card" />
      </section>

      {/* ── Content ── */}
      <section className="px-4 lg:px-6 pb-20">
        <div className="flex flex-col gap-16 max-w-[780px]">
          <div>
            <h2 className="text-[1.75rem] lg:text-[3rem] font-light tracking-tight mb-4">
              Desafio
            </h2>
            <p className="text-[18px] lg:text-body-lg font-light leading-body-lg text-black/80">
              {c.challenge}
            </p>
          </div>

          <div>
            <h2 className="text-[1.75rem] lg:text-[3rem] font-light tracking-tight mb-4">
              Hipóteses
            </h2>
            <p className="text-[18px] lg:text-body-lg font-light leading-body-lg text-black/80">
              {c.hypothesis}
            </p>
          </div>

          <div>
            <h2 className="text-[1.75rem] lg:text-[3rem] font-light tracking-tight mb-4">
              Resultados
            </h2>
            <p className="text-[18px] lg:text-body-lg font-light leading-body-lg text-black/80">
              {c.results}
            </p>
          </div>
        </div>
      </section>

      {/* ── Additional images ── */}
      <section className="px-4 lg:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="aspect-[4/3] rounded-3xl bg-card" />
          <div className="aspect-[4/3] rounded-3xl bg-card" />
          <div className="aspect-[4/3] rounded-3xl bg-card" />
          <div className="aspect-[4/3] rounded-3xl bg-card" />
        </div>
      </section>

      {/* ── Tags ── */}
      <section className="px-4 lg:px-6 pb-16 border-t border-black/5 pt-8">
        <div className="flex flex-wrap gap-2">
          {c.tags.map((tag) => (
            <span
              key={tag}
              className="text-[14px] font-medium text-muted border border-black/10 rounded-full px-4 py-1.5"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── Other cases ── */}
      <section className="px-4 lg:px-6 py-16 border-t border-black/5">
        <p className="text-[16px] font-medium text-muted mb-8 uppercase tracking-widest text-sm">
          Outros Cases
        </p>
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
          {otherCases.map((oc) => (
            <Link
              key={oc.slug}
              href={`/cases/${oc.slug}`}
              className="shrink-0 w-[300px] lg:w-[380px] group"
            >
              <div className="w-full aspect-[4/3] rounded-3xl bg-card mb-4 overflow-hidden">
                <div className="w-full h-full opacity-0 group-hover:opacity-100 bg-black/5 transition-opacity" />
              </div>
              <h3 className="text-[20px] font-light group-hover:opacity-60 transition-opacity">
                {oc.title}
              </h3>
              <p className="text-[14px] font-normal text-muted mt-1">{oc.client}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
