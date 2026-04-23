import type { Metadata } from 'next'
import TeamCarousel from '@/components/sections/TeamCarousel'
import Button from '@/components/ui/Button'
import { team } from '@/lib/data'
import { webPageSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Sobre',
  description:
    'A Floux foi fundada para suprir a necessidade de times de design orientados ao crescimento do negócio e à entrega de valor para o usuário.',
  alternates: { canonical: 'https://floux.com.br/sobre' },
  openGraph: { url: 'https://floux.com.br/sobre', title: 'Sobre | Floux' },
}

export default function SobrePage() {
  const jsonLd = webPageSchema({
    title: 'Sobre a Floux',
    description:
      'A Floux foi fundada para suprir a necessidade de times de design orientados ao crescimento do negócio.',
    url: 'https://floux.com.br/sobre',
    breadcrumbs: [
      { name: 'Início', url: 'https://floux.com.br' },
      { name: 'Sobre', url: 'https://floux.com.br/sobre' },
    ],
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ── */}
      <section className="min-h-[80vh] flex flex-col justify-center px-4 lg:px-6 py-20 lg:py-32">
        <h1 className="text-[3rem] sm:text-[5rem] lg:text-display font-light leading-display tracking-display text-black max-w-[1100px]">
          Não existe experiência sem crescimento
        </h1>
      </section>

      {/* ── Manifesto ── */}
      <section className="px-4 lg:px-6 pb-20">
        <div className="max-w-[620px]">
          <p className="text-[18px] lg:text-body-lg font-normal leading-body-lg">
            A Floux foi fundada para suprir a necessidade de times de design orientados não somente
            à entrega de valor para o usuário, mas também para o crescimento do negócio, colocando
            ambas as métricas no mesmo processo de design.{' '}
            <span className="font-semibold">
              Você pode conhecer nossa metodologia clicando aqui.
            </span>
          </p>
        </div>
      </section>

      {/* ── Como atuamos ── */}
      <section className="px-4 lg:px-6 py-16 border-t border-black/5">
        <h2 className="text-[2.5rem] lg:text-h2 font-light tracking-h2 leading-h2 mb-4">
          Formas de atuação
        </h2>
        <p className="text-[18px] lg:text-body-lg font-normal leading-body-lg text-black/80 mb-12 max-w-[500px]">
          Projetos, Outsourcing, Hunting e Treinamento.
        </p>

        {/* Team — Conselheiros */}
        <div className="mb-16">
          <h3 className="text-[2rem] lg:text-[3rem] font-light tracking-tight mb-4">
            Conselheiros
          </h3>
          <p className="text-[18px] lg:text-body-lg font-normal leading-body-lg text-black/80 max-w-[500px]">
            Profissionais renomados que podem atuar de forma reduzida e pontual, fornecendo visão
            estratégica e insights para projetos.
          </p>
        </div>
        <TeamCarousel />
      </section>

      {/* ── Fundador ── */}
      <section className="px-4 lg:px-6 py-16 border-t border-black/5">
        <h2 className="text-[2rem] lg:text-[3rem] font-light tracking-tight mb-8">
          Fundador &amp; CEO
        </h2>
        <div className="flex flex-col lg:flex-row gap-12 max-w-[900px]">
          <div className="w-full lg:w-[400px] aspect-square rounded-3xl bg-card shrink-0" />
          <div className="flex flex-col justify-center">
            <div className="bg-card-dark rounded-2xl px-4 py-4 mb-6">
              <p className="font-medium text-[20px]">{team[0].name}</p>
              <p className="text-[14px] font-light text-muted">{team[0].title}</p>
            </div>
            <p className="text-[18px] lg:text-body-lg font-normal leading-body-lg text-black/80">
              {team[0].bio}
            </p>
          </div>
        </div>
      </section>

      {/* ── Video placeholder ── */}
      <section className="px-4 lg:px-6 py-16 border-t border-black/5">
        <div className="w-full aspect-video rounded-3xl bg-card flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-black/10 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon points="5,3 19,12 5,21" fill="black" />
            </svg>
          </div>
        </div>
      </section>
    </>
  )
}
