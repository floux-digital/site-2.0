import type { Metadata } from 'next'
import Link from 'next/link'
import DesktopSidebar from '@/components/layout/DesktopSidebar'
import { cases } from '@/lib/data'
import { webPageSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Cases',
  description:
    'Conheça alguns dos cases mais inspiradores em que algum de nós tivemos a oportunidade de liderar ou fazer parte.',
  alternates: { canonical: 'https://floux.com.br/cases' },
  openGraph: { url: 'https://floux.com.br/cases', title: 'Cases | Floux' },
}

export default function CasesPage() {
  const jsonLd = webPageSchema({
    title: 'Cases da Floux',
    description: 'Foi alguém de nós quem fez.',
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

      {/* ── Hero — sidebar lives here ── */}
      <section className="px-4 lg:px-[44px] py-[66px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <DesktopSidebar />

          <div className="flex-1 flex flex-col gap-[44px]">
            <div className="pb-[44px]">
              <h1 className="max-w-[800px]">Foi alguém de nós quem fez</h1>
            </div>

            <p className="max-w-[285px]">
              Conheça alguns dos cases mais inspiradores em que algum de nós tivemos a
              oportunidade de liderar ou fazer parte
            </p>
          </div>
        </div>
      </section>

      {/* ── Cases list ── */}
      {cases.map((c) => (
        <section key={c.slug} className="px-4 lg:px-[44px] py-[66px]">
          <div className="flex flex-col lg:flex-row lg:items-start">
            <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />

            <Link
              href={`/cases/${c.slug}`}
              className="flex-1 flex flex-col gap-[22px] group"
            >
              <div className="w-full h-[446px] rounded-3xl bg-card group-hover:opacity-90 transition-opacity" />
              <p className="px-[22px]">
                {c.title} {c.client}
              </p>
            </Link>
          </div>
        </section>
      ))}
    </>
  )
}
