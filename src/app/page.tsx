import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import LogoCarousel from '@/components/sections/LogoCarousel'
import TestimonialCarousel from '@/components/sections/TestimonialCarousel'
import CaseCarousel from '@/components/sections/CaseCarousel'
import { services } from '@/lib/data'
import { webPageSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Floux — Consultoria de design e tecnologia para negócios',
  description:
    'Criamos experiências que entregam valor para seus clientes e crescimento para o seu negócio. Consultoria de design strategy, UX research e product design.',
  alternates: { canonical: 'https://floux.com.br' },
  openGraph: {
    url: 'https://floux.com.br',
    title: 'Floux — Consultoria de design e tecnologia para negócios',
  },
}

export default function HomePage() {
  const jsonLd = webPageSchema({
    title: 'Floux — Consultoria de design e tecnologia para negócios',
    description:
      'Criamos experiências que entregam valor para seus clientes e crescimento para o seu negócio.',
    url: 'https://floux.com.br',
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ── */}
      <section className="min-h-[90vh] flex flex-col justify-center px-4 lg:px-6 py-20 lg:py-32">
        <div className="max-w-[1100px]">
          <h1 className="text-[3.5rem] sm:text-[5rem] lg:text-display font-light leading-display tracking-display text-black">
            Consultoria de design e tecnologia para negócios
          </h1>
        </div>

        <div className="mt-16 max-w-xs">
          <p className="text-[18px] lg:text-body-lg font-semibold leading-body-lg">
            O que fazemos
          </p>
          <p className="text-[18px] lg:text-body-lg font-light leading-body-lg mt-2">
            Criamos experiências que entregam valor para seus clientes e crescimento para o seu
            negócio.
          </p>
        </div>
      </section>

      {/* ── Cases carousel ── */}
      <CaseCarousel />

      {/* ── Logo strip ── */}
      <LogoCarousel />

      {/* ── About teaser ── */}
      <section className="py-20 lg:py-28 px-4 lg:px-6">
        <div className="max-w-[700px]">
          <h2 className="text-[2.5rem] lg:text-h2 font-light tracking-h2 leading-h2 mb-8">
            Pessoas, valor e crescimento
          </h2>
          <p className="text-[18px] lg:text-body-lg font-light leading-body-lg text-black/80 mb-8">
            A Floux nasceu da dificuldade que times de design têm para enxergar a importância do
            crescimento do negócio para financiar a oferta de valor para seus clientes.
          </p>
          <Button href="/sobre" withArrow>
            Saiba mais
          </Button>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-10 lg:py-16 px-4 lg:px-6 border-t border-black/5">
        <p className="text-[18px] text-muted font-normal mb-6">Serviços</p>
        <div className="flex flex-col lg:flex-row lg:gap-16">
          <div className="flex-1">
            {services.map((s, i) => (
              <div key={s.slug} className="group">
                <div
                  className={`flex items-center justify-between py-4 border-b border-black/10 ${
                    i === 0 ? 'border-t border-black/10' : ''
                  }`}
                >
                  <div>
                    <h3 className="text-[1.5rem] lg:text-[2.5rem] font-light">{s.title}</h3>
                  </div>
                  <Link
                    href={`/servicos#${s.slug}`}
                    aria-label={`Ver ${s.title}`}
                    className="w-8 h-8 rounded-full border border-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4"
                  >
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 mt-8 lg:mt-0">
            <p className="text-[18px] lg:text-body-lg font-light leading-body-lg text-black/80 mb-8">
              {services[0].description}
            </p>
            <Button href="/servicos" withArrow>
              Saiba mais
            </Button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <TestimonialCarousel />
    </>
  )
}
