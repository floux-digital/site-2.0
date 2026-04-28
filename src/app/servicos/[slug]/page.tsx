import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DesktopSidebar from '@/components/layout/DesktopSidebar'
import Accordion from '@/components/sections/ServiceAccordion'
import FlImage from '@/components/ui/FlImage'
import { services } from '@/lib/data'
import { webPageSchema, serviceSchema } from '@/lib/schema'

const allSubservices = services.flatMap((s) => s.subservices)

export async function generateStaticParams() {
  return allSubservices.map((sub) => ({ slug: sub.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const sub = allSubservices.find((s) => s.slug === slug)
  if (!sub) return {}

  return {
    title: sub.headline,
    description: sub.intro,
    alternates: { canonical: `https://flouxdigital.com.br/servicos/${slug}` },
    openGraph: {
      url: `https://flouxdigital.com.br/servicos/${slug}`,
      title: `${sub.headline} | Floux`,
    },
  }
}

type MethodItem = { title: string; description: string }
type SubWithExtras = typeof allSubservices[number] & {
  image?: string
  pageIntro?: string
  methodsHeading?: string
  section2Heading?: string
  section2Body?: string
  methods: MethodItem[]
  methods2?: MethodItem[]
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const sub = allSubservices.find((s) => s.slug === slug) as SubWithExtras | undefined
  if (!sub) notFound()

  const parent = services.find((s) => s.subservices.some((ss) => ss.slug === slug))

  const jsonLd = [
    webPageSchema({
      title: sub.headline,
      description: sub.intro,
      url: `https://flouxdigital.com.br/servicos/${slug}`,
      breadcrumbs: [
        { name: 'Início', url: 'https://flouxdigital.com.br' },
        { name: 'Serviços', url: 'https://flouxdigital.com.br/servicos' },
        { name: sub.headline, url: `https://flouxdigital.com.br/servicos/${slug}` },
      ],
    }),
    serviceSchema({
      name: sub.headline,
      description: sub.body,
      url: `https://flouxdigital.com.br/servicos/${slug}`,
    }),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero — sidebar + title + image + intro ── */}
      <section className="padding-x py-[66px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <DesktopSidebar />

          <div className="w-full flex flex-col gap-[44px] lg:max-w-[800px] 2xl:max-w-[980px]">
            <h1>
              {parent?.title}: {sub.headline}
            </h1>

            <FlImage src={sub.image || undefined} alt={sub.headline} />

            <p>{sub.pageIntro ?? sub.intro}</p>
          </div>
        </div>
      </section>

      {/* ── Methods section ── */}
      {sub.methodsHeading && (
        <section className="padding-x py-[66px]">
          <div className="flex flex-col lg:flex-row lg:items-start">
            <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
            <div className="w-full flex flex-col gap-[44px] lg:max-w-[800px] 2xl:max-w-[980px]">
              <h2>{sub.methodsHeading}</h2>
              <p>{sub.body}</p>
              <div className="py-[66px]">
                <Accordion
                  items={sub.methods.map((m) => ({ title: m.title, body: m.description }))}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Section 2 ── */}
      {sub.section2Heading && (
        <section className="padding-x py-[66px]">
          <div className="flex flex-col lg:flex-row lg:items-start">
            <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
            <div className="w-full flex flex-col gap-[44px] lg:max-w-[800px] 2xl:max-w-[980px]">
              <h2>{sub.section2Heading}</h2>
              <p>{sub.section2Body}</p>
              {sub.methods2 && sub.methods2.length > 0 && (
                <div className="py-[66px]">
                  <Accordion
                    items={sub.methods2.map((m) => ({ title: m.title, body: m.description }))}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
