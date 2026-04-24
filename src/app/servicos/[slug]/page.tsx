import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import Button from '@/components/ui/Button'
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
    alternates: { canonical: `https://floux.com.br/servicos/${slug}` },
    openGraph: {
      url: `https://floux.com.br/servicos/${slug}`,
      title: `${sub.headline} | Floux`,
    },
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const sub = allSubservices.find((s) => s.slug === slug)
  if (!sub) notFound()

  const parent = services.find((s) => s.subservices.some((ss) => ss.slug === slug))

  const jsonLd = [
    webPageSchema({
      title: sub.headline,
      description: sub.intro,
      url: `https://floux.com.br/servicos/${slug}`,
      breadcrumbs: [
        { name: 'Início', url: 'https://floux.com.br' },
        { name: 'Serviços', url: 'https://floux.com.br/servicos' },
        { name: sub.headline, url: `https://floux.com.br/servicos/${slug}` },
      ],
    }),
    serviceSchema({
      name: sub.headline,
      description: sub.body,
      url: `https://floux.com.br/servicos/${slug}`,
    }),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ── */}
      <section className="min-h-[70vh] flex flex-col justify-center px-4 lg:px-6 py-20 lg:py-32">
        <p className="text-[16px] font-medium text-muted mb-4">
          <Link href="/servicos" className="hover:text-black transition-colors">
            Serviços
          </Link>{' '}
          / {parent?.title}
        </p>
        <h1 className="max-w-[1100px]">{sub.headline}</h1>
      </section>

      {/* ── Intro ── */}
      <section className="px-4 lg:px-6 pb-20">
        <div className="max-w-[780px]">
          <p className="text-[18px] text-black/80">{sub.intro}</p>
        </div>
      </section>

      {/* ── Image placeholder ── */}
      <section className="px-4 lg:px-6 pb-16">
        <div className="w-full aspect-[16/9] rounded-3xl bg-card" />
      </section>

      {/* ── Methods ── */}
      <section className="px-4 lg:px-6 py-16 border-t border-black/5">
        <div className="flex flex-col lg:flex-row lg:gap-16">
          <div className="lg:w-[480px] shrink-0">
            <h2 className="mb-6 max-w-[500px]">
              Vamos descobrir tudo que for possível
            </h2>
            <p className="text-[18px] text-black/80">{sub.body}</p>
          </div>

          <div className="flex-1 mt-10 lg:mt-0">
            <div className="flex flex-col">
              {sub.methods.map((method, i) => (
                <div
                  key={method}
                  className={`flex items-center justify-between py-4 border-b border-black/10 ${
                    i === 0 ? 'border-t border-black/10' : ''
                  }`}
                >
                  <span className="text-[1.25rem] lg:text-[1.5rem]">{method}</span>
                  <ArrowUpRight size={16} className="text-muted shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 lg:px-6 py-16 border-t border-black/5">
        <div className="max-w-[780px]">
          <h2 className="mb-6">
            Vamos te ajudar a alinhar sua oferta de valor e expectativa dos clientes
          </h2>
          <Button href="mailto:contato@floux.com.br" withArrow external>
            Entre em contato
          </Button>
        </div>
      </section>

      {/* ── Related services ── */}
      {parent && parent.subservices.filter((s) => s.slug !== slug).length > 0 && (
        <section className="px-4 lg:px-6 py-16 border-t border-black/5">
          <h4 className="font-medium text-muted mb-6">Outros serviços</h4>
          <div className="flex flex-col gap-2">
            {parent.subservices
              .filter((s) => s.slug !== slug)
              .map((s) => (
                <Link
                  key={s.slug}
                  href={`/servicos/${s.slug}`}
                  className="group flex items-center justify-between py-4 border-b border-black/10 first:border-t first:border-black/10"
                >
                  <span className="text-[1.25rem] lg:text-[1.5rem] hover:opacity-60 transition-opacity">
                    {s.title}
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  />
                </Link>
              ))}
          </div>
        </section>
      )}
    </>
  )
}
