import type { Metadata } from 'next'
import DesktopSidebar from '@/components/layout/DesktopSidebar'
import TeamCarousel from '@/components/sections/TeamCarousel'
import { team } from '@/lib/data'
import { webPageSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Sobre',
  description:
    'A Floux foi fundada para suprir a necessidade de times de design orientados ao crescimento do negócio e à entrega de valor para o usuário.',
  alternates: { canonical: 'https://flouxdigital.com.br/sobre' },
  openGraph: { url: 'https://flouxdigital.com.br/sobre', title: 'Sobre | Floux' },
}

export default function SobrePage() {
  const jsonLd = webPageSchema({
    title: 'Sobre a Floux',
    description:
      'A Floux foi fundada para suprir a necessidade de times de design orientados ao crescimento do negócio.',
    url: 'https://flouxdigital.com.br/sobre',
    breadcrumbs: [
      { name: 'Início', url: 'https://flouxdigital.com.br' },
      { name: 'Sobre', url: 'https://flouxdigital.com.br/sobre' },
    ],
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero — sidebar lives here ── */}
      <section className="padding-x py-[66px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <DesktopSidebar />

          <div className="flex-1 flex flex-col gap-[44px]">
            <div className="pb-[44px]">
              <h1 className="max-w-[800px]">
                Não existe experiência sem crescimento
              </h1>
            </div>

            <p className="max-w-[400px]">
              A Floux foi fundada para suprir a necessidade de times de design orientados não
              somente à entrega de valor para o usuário, mas também para o crescimento do
              negócio, colocando ambas as métricas no mesmo processo de design, que você pode
              conhecer{' '}
              <span className="font-semibold">clicando aqui.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Fundador & CEO ── */}
      <section className="padding-x py-[66px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
          <div className="flex-1 flex flex-col gap-[44px] max-w-[600px]">
            <h2>Fundador &amp; CEO</h2>
            <p className="max-w-[400px]">{team[0].bio}</p>
          </div>
        </div>
      </section>

      {/* ── Foto / vídeo placeholder ── */}
      <section className="padding-x py-[66px]">
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

      {/* ── Conselheiros ── */}
      <section className="padding-x py-[66px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
          <div className="flex-1 flex flex-col gap-[44px] max-w-[600px]">
            <h2>Conselheiros</h2>
            <p className="max-w-[360px]">
              Profissionais renomados que podem atuar de forma reduzida e pontual, fornecendo
              visão estratégica e insights para projetos.
            </p>
          </div>
        </div>
      </section>

      {/* ── Team carousel — naturally full-width ── */}
      <TeamCarousel />

      {/* ── Formas de atuação ── */}
      <section className="padding-x py-[66px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
          <div className="flex-1 flex flex-col gap-[44px] max-w-[600px]">
            <h2>Formas de Atuação</h2>
            <p className="max-w-[360px]">
              Projetos, Outsourcing, Hunting e Treinamento.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
