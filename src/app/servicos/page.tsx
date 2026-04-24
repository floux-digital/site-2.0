import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import Button from '@/components/ui/Button'
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

      {/* ── Hero ── */}
      <section className="min-h-[70vh] flex flex-col justify-center px-4 lg:px-6 py-20 lg:py-32">
        <h1 className="max-w-[1100px]">Conheça nossos serviços</h1>

        {/* Quick nav */}
        <div className="mt-12 max-w-xs">
          <p className="text-[18px] font-semibold mb-2">Escolha ou role para baixo</p>
          <ul className="flex flex-col gap-1">
            {services.map((s) => (
              <li key={s.slug}>
                <a
                  href={`#${s.slug}`}
                  className="text-[18px] hover:opacity-60 transition-opacity"
                >
                  {s.number} {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Service sections ── */}
      {services.map((service) => (
        <section
          key={service.slug}
          id={service.slug}
          className="border-t border-black/5 py-20 lg:py-28 px-4 lg:px-6 scroll-mt-20"
        >
          <div className="flex flex-col lg:flex-row lg:gap-16">
            {/* Left: Title + sub-list */}
            <div className="lg:w-[480px] shrink-0">
              <h2 className="mb-10">{service.number} {service.title}</h2>

              {/* Subservices list */}
              {service.subservices && service.subservices.length > 0 && (
                <div className="flex flex-col">
                  {service.subservices.map((sub, i) => (
                    <div key={sub.slug}>
                      <div className={`border-b border-black/10 ${i === 0 ? 'border-t border-black/10' : ''}`}>
                        <Link
                          href={`/servicos/${sub.slug}`}
                          className="group flex items-center justify-between py-4 text-[1.25rem] lg:text-[1.5rem] hover:opacity-60 transition-opacity"
                        >
                          <span>{sub.title}</span>
                          <ArrowUpRight
                            size={16}
                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Roles for Outsourcing */}
              {'roles' in service && Array.isArray(service.roles) && (
                <ul className="flex flex-col gap-1 mt-4">
                  {service.roles.map((role) => (
                    <li key={role} className="text-[18px] font-medium">
                      - {role}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right: Image placeholder + description + CTA */}
            <div className="flex-1 mt-10 lg:mt-0">
              <div className="w-full aspect-[16/9] rounded-3xl bg-card mb-8" />
              <p className="text-[18px] text-black/80 mb-8 max-w-[600px]">
                {service.description}
              </p>
              {service.subservices && service.subservices.length > 0 && (
                <Button href={`/servicos/${service.subservices[0].slug}`} withArrow>
                  Saiba mais
                </Button>
              )}
            </div>
          </div>
        </section>
      ))}
    </>
  )
}
