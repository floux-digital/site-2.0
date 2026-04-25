import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DesktopSidebar from '@/components/layout/DesktopSidebar'
import CaseCarousel from '@/components/sections/CaseCarousel'
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

      {/* ── Hero — sidebar lives here ── */}
      <section className="px-4 lg:px-[44px] py-[66px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <DesktopSidebar />

          <div className="flex-1 flex flex-col gap-[44px]">
            <h1>{c.title}</h1>
            <p className="font-medium uppercase">{c.client}</p>
          </div>
        </div>
      </section>

      {/* ── Cover image — full-width within section padding ── */}
      <section className="px-4 lg:px-[44px] py-[66px]">
        <div className="w-full aspect-[16/7] rounded-3xl bg-card" />
      </section>

      {/* ── Desafios ── */}
      <section className="px-4 lg:px-[44px] py-[66px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
          <div className="flex-1 flex flex-col gap-[44px] max-w-[500px]">
            <h2>Desafios</h2>
            <p>{c.challenge}</p>
          </div>
        </div>
      </section>

      {/* ── Hipóteses ── */}
      <section className="px-4 lg:px-[44px] py-[66px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
          <div className="flex-1 flex flex-col gap-[44px] max-w-[500px]">
            <h2>Hipóteses</h2>
            <p>{c.hypothesis}</p>
          </div>
        </div>
      </section>

      {/* ── Resultados ── */}
      <section className="px-4 lg:px-[44px] py-[66px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
          <div className="flex-1 flex flex-col gap-[44px] max-w-[500px]">
            <h2>Resultados</h2>
            <p>{c.results}</p>
          </div>
        </div>
      </section>

      {/* ── Gallery — 2-col grid, no sidebar offset ── */}
      <section className="px-4 lg:px-[44px] py-[66px]">
        <div className="flex flex-wrap gap-[22px]">
          <div className="w-full lg:w-[calc(50%-11px)] aspect-[4/3] rounded-3xl bg-card" />
          <div className="w-full lg:w-[calc(50%-11px)] aspect-[4/3] rounded-3xl bg-card" />
          <div className="w-full lg:w-[calc(50%-11px)] aspect-[4/3] rounded-3xl bg-card" />
          <div className="w-full lg:w-[calc(50%-11px)] aspect-[4/3] rounded-3xl bg-card" />
        </div>
      </section>

      {/* ── Other cases ── */}
      <p className="px-4 lg:px-[44px] pt-[66px] font-medium text-[20px] uppercase">
        Outros Cases
      </p>
      <CaseCarousel cases={otherCases} />
    </>
  )
}
