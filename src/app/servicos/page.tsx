import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Button from '@/components/ui/Button'
import DesktopSidebar from '@/components/layout/DesktopSidebar'
import { services } from '@/lib/data'
import { webPageSchema, serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Serviços',
  description:
    'Projetos, Outsourcing e Hunting e Treinamento. Conheça como a Floux pode ajudar o seu negócio com design estratégico.',
  alternates: { canonical: 'https://floux.com.br/servicos' },
  openGraph: { url: 'https://floux.com.br/servicos', title: 'Serviços | Floux' },
}

export default function ServicosPage() {
  const jsonLd = [
    webPageSchema({
      title: 'Serviços da Floux',
      description: 'Projetos, Outsourcing e Hunting e Treinamento.',
      url: 'https://floux.com.br/servicos',
      breadcrumbs: [
        { name: 'Início', url: 'https://floux.com.br' },
        { name: 'Serviços', url: 'https://floux.com.br/servicos' },
      ],
    }),
    ...services.map((s) =>
      serviceSchema({
        name: s.title,
        description: s.description,
        url: `https://floux.com.br/servicos#${s.slug}`,
      })
    ),
  ]

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
              <h1 className="max-w-[800px]">Conheça nossos serviços</h1>
            </div>

            <p className="font-semibold max-w-[285px]">Escolha um ou role para baixo</p>

            <ul className="flex flex-col gap-1">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`#${s.slug}`}
                    className="hover:opacity-60 transition-opacity"
                  >
                    {s.number} {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Service sections ── */}
      {services.map((service) => (
        <div key={service.slug} id={service.slug} className="scroll-mt-[88px]">

          {/* Intro */}
          <section className="px-4 lg:px-[44px] py-[66px]">
            <div className="flex flex-col lg:flex-row lg:items-start">
              <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
              <div className="flex-1 flex flex-col gap-[44px] max-w-[600px]">
                <h2>{service.number} {service.title}</h2>
                <p className="max-w-[400px]">{service.description}</p>
              </div>
            </div>
          </section>

          {/* Image placeholder — full-width on mobile, right-aligned on desktop */}
          <section className="px-4 lg:px-[44px] py-[66px] flex justify-end">
            <div className="w-full lg:max-w-[827px] aspect-[16/9] rounded-3xl bg-card" />
          </section>

          {/* Subservices accordion */}
          {service.subservices.length > 0 && (
            <section className="px-4 lg:px-[44px] py-[66px]">
              <div className="flex flex-col lg:flex-row lg:items-start">
                <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
                <div className="flex-1 max-w-[900px]">
                  {service.subservices.map((sub, i) => (
                    <details
                      key={sub.slug}
                      open={i === 0}
                      className="group border-b border-black/25"
                    >
                      <summary className="flex items-center justify-between py-8 cursor-pointer list-none">
                        <h3>{sub.title}</h3>
                        <span className="shrink-0 ml-4">
                          <ChevronUp size={24} className="hidden group-open:block" />
                          <ChevronDown size={24} className="group-open:hidden" />
                        </span>
                      </summary>
                      <div className="pb-[44px] flex flex-col gap-[44px]">
                        <p className="max-w-[500px]">{sub.intro}</p>
                        <Button href={`/servicos/${sub.slug}`} withArrow>
                          Saiba Mais
                        </Button>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      ))}
    </>
  )
}
