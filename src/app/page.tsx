import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Button from '@/components/ui/Button'
import DesktopSidebar from '@/components/layout/DesktopSidebar'
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

      {/* ── Hero — sidebar lives here ── */}
      <section className="px-4 lg:px-[44px] py-[66px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <DesktopSidebar />

          <div className="w-full max-w-[900px] flex flex-col gap-[44px]">
            <div className="pb-[44px] lg:pb-[88px]">
              <h1 className="xl:max-w-[800px] 2xl:max-w-[900px]">
                Consultoria de design e tecnologia para negócios
              </h1>
            </div>

            <p className="font-semibold lg:max-w-[285px]">
              O que fazemos
            </p>
            <p className="lg:max-w-[360px]">
              Criamos experiências que entregam valor para seus clientes e crescimento para o
              seu negócio.
            </p>
          </div>
        </div>
      </section>

      {/* ── Cases carousel — naturally full-width ── */}
      <CaseCarousel />

      {/* ── About teaser ── */}
      <section className="px-4 lg:px-[44px] py-[66px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
          <div className="flex-1 flex flex-col gap-[44px] max-w-[600px]">
            <h2>Pessoas, valor e crescimento</h2>
            <p className="text-black/80">
              A Floux nasceu da dificuldade que times de design têm para enxergar a
              importância do crescimento do negócio para financiar a oferta de valor para
              seus clientes.
            </p>
            <Button href="/sobre" withArrow>
              Saiba mais
            </Button>
          </div>
        </div>
      </section>

      {/* ── Logo strip — naturally full-width ── */}
      <LogoCarousel />

      {/* ── Services accordion ── */}
      <section className="px-4 lg:px-[44px] py-[66px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
          <div className="flex-1">
            <p className="font-semibold mb-[22px]">Serviços</p>
            <div className="flex flex-col max-w-[900px]">
              {services.map((s, i) => (
                <details key={s.slug} open={i === 0} className="group border-b border-black/25">
                  <summary className="flex items-center justify-between py-10 cursor-pointer list-none">
                    <h3>{s.title}</h3>
                    <span className="shrink-0 ml-4">
                      <ChevronUp size={24} className="hidden group-open:block" />
                      <ChevronDown size={24} className="group-open:hidden" />
                    </span>
                  </summary>
                  <div className="pb-[44px] flex flex-col gap-[44px]">
                    <p className="text-black/80">{s.description}</p>
                    <Button href={`/servicos`} withArrow>
                      Saiba Mais
                    </Button>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured cases — two large image placeholders ── */}
      <section className="py-[66px]">
        <div className="flex gap-6 px-4 lg:px-[44px]">
          <div className="flex-1 aspect-[4/3] rounded-3xl bg-card" />
          <div className="flex-1 aspect-[4/3] rounded-3xl bg-card hidden lg:block" />
        </div>
        <div className="flex items-center px-4 lg:px-[44px] py-[22px] gap-4">
          <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
          <Link
            href="/cases"
            className="w-10 h-10 rounded-[20px] border border-black/25 flex items-center justify-center hover:bg-black hover:text-white transition-colors shrink-0 text-[12px] font-medium"
            aria-label="Ver todos os cases"
          >
            →
          </Link>
        </div>
      </section>

      {/* ── Testimonials heading ── */}
      <section className="px-4 lg:px-[44px] py-[66px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
          <div className="flex-1">
            <h2 className="max-w-[300px] lg:max-w-[400px] xl:max-w-[600px]">Experiência posta à prova</h2>
          </div>
        </div>
      </section>

      {/* ── Testimonials carousel — naturally full-width ── */}
      <TestimonialCarousel />
    </>
  )
}
