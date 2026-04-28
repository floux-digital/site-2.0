import type { Metadata } from 'next'
import DesktopSidebar from '@/components/layout/DesktopSidebar'
import { webPageSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Aviso de privacidade da Floux Digital — como coletamos, usamos e protegemos seus dados pessoais.',
  alternates: { canonical: 'https://flouxdigital.com.br/privacidade' },
  openGraph: { url: 'https://flouxdigital.com.br/privacidade', title: 'Política de Privacidade | Floux' },
}

export default function PrivacidadePage() {
  const jsonLd = webPageSchema({
    title: 'Política de Privacidade — Floux Digital',
    description: 'Aviso de privacidade da Floux Digital.',
    url: 'https://flouxdigital.com.br/privacidade',
    breadcrumbs: [
      { name: 'Início', url: 'https://flouxdigital.com.br' },
      { name: 'Privacidade', url: 'https://flouxdigital.com.br/privacidade' },
    ],
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ── */}
      <section className="padding-x py-[66px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <DesktopSidebar />
          <div className="flex-1 flex flex-col gap-[22px]">
            <h1>Aviso de Privacidade</h1>
            <p className="text-muted">Última atualização: Abril de 2026</p>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="padding-x pb-[88px]">
        <div className="flex flex-col lg:flex-row lg:items-start">
          <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />

          <div className="flex-1 max-w-[980px] flex flex-col gap-[44px]">

            {/* 1. Quem somos */}
            <div className="flex flex-col gap-12 py-[44px] py-[44px]">
              <h3>1. Quem somos</h3>
              <p>
                <strong>FLOUX DIGITAL</strong> ("Sociedade") é a controladora responsável pelo
                tratamento dos dados pessoais coletados na plataforma e nos serviços por ela
                oferecidos. São considerados <strong>Titulares</strong> todos os indivíduos que
                interagem com a Sociedade: clientes, candidatos, parceiros, fornecedores e
                visitantes.
              </p>
            </div>

            {/* 2. Encarregado */}
            <div className="flex flex-col gap-12 py-[44px]">
              <h3>2. Encarregado (DPO)</h3>
              <p>
                <strong>Jeff Monteiro</strong>
                <br />
                <a href="mailto:dados@flouxdigital.com.br" className="underline hover:opacity-60 transition-opacity">
                  dados@flouxdigital.com.br
                </a>
              </p>
            </div>

            {/* 3. Dados coletados */}
            <div className="flex flex-col gap-12 py-[44px]">
              <h3>3. Dados coletados</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/15">
                      <th className="py-3 pr-6 font-semibold">Perfil do Titular</th>
                      <th className="py-3 font-semibold">Dados</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    <tr className="border-b border-black/10">
                      <td className="py-3 pr-6 font-medium">Cliente</td>
                      <td className="py-3">Nome, CPF, endereço, e-mail, telefone, data de nascimento</td>
                    </tr>
                    <tr className="border-b border-black/10">
                      <td className="py-3 pr-6 font-medium">Interessado em promoções</td>
                      <td className="py-3">E-mail</td>
                    </tr>
                    <tr className="border-b border-black/10">
                      <td className="py-3 pr-6 font-medium">Representante de fornecedor</td>
                      <td className="py-3">Nome, e-mail, telefone, endereço, RG, CPF</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-6 font-medium">Fornecedor / parceiro PF</td>
                      <td className="py-3">Nome, e-mail, telefone, endereço, RG, CPF, dados bancários</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Finalidades */}
            <div className="flex flex-col gap-12 py-[44px]">
              <h3>4. Para que usamos seus dados</h3>
              <ul className="flex flex-col gap-2 list-none">
                {[
                  ['Serviços', 'cadastro, execução, cobranças e suporte'],
                  ['Plataforma', 'identificação, navegação e melhorias'],
                  ['Processos seletivos', 'análise de currículos'],
                  ['Comunicação', 'avisos, atualizações e atendimento'],
                  ['Marketing', 'e-mail marketing e anúncios personalizados (opt-out disponível)'],
                  ['Segurança e backup', 'prevenção a fraudes e cópias de segurança'],
                  ['Perfil de consumo', 'aprimoramento de produtos e serviços'],
                ].map(([label, desc]) => (
                  <li key={label} className="flex gap-2">
                    <span className="shrink-0">—</span>
                    <span><strong>{label}:</strong> {desc}</span>
                  </li>
                ))}
              </ul>
              <p className="">
                A Sociedade também pode coletar dados via cookies, endereço IP e histórico de
                navegação para personalizar a experiência na plataforma.
              </p>
            </div>

            {/* 4.1 Cookies */}
            <div className="flex flex-col gap-12 py-[44px]">
              <h3>4.1 Cookies e tecnologias similares</h3>
              <p>A plataforma utiliza cookies próprios e de terceiros para as seguintes finalidades:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/15">
                      <th className="py-3 pr-6 font-semibold">Tipo</th>
                      <th className="py-3 pr-6 font-semibold">Finalidade</th>
                      <th className="py-3 font-semibold">Exemplos</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {[
                      ['Essenciais', 'Funcionamento básico da plataforma, autenticação e segurança', 'Sessão, CSRF'],
                      ['Analíticos', 'Mensuração de uso, desempenho e otimização da experiência', 'Google Analytics, Hotjar'],
                      ['Publicitários', 'Exibição de anúncios personalizados com base no perfil e comportamento do Titular', 'Google Ads, Meta Pixel'],
                      ['Funcionais', 'Preferências do usuário, como idioma e configurações salvas', 'Preferências de layout'],
                    ].map(([tipo, fin, ex]) => (
                      <tr key={tipo} className="border-b border-black/10 last:border-0">
                        <td className="py-3 pr-6 font-medium align-top">{tipo}</td>
                        <td className="py-3 pr-6 align-top">{fin}</td>
                        <td className="py-3 align-top text-muted">{ex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="">
                Os cookies de terceiros são gerenciados por empresas parceiras (ex.: Google, Meta)
                que possuem suas próprias políticas de privacidade. A Floux Digital não controla
                os dados coletados diretamente por esses parceiros, mas exige que operem em
                conformidade com a legislação aplicável.
              </p>
              <p className="">
                O Titular pode, a qualquer momento, <strong>gerenciar ou revogar</strong> sua
                preferência de cookies diretamente no banner de consentimento da plataforma ou
                nas configurações do seu navegador. A desativação de cookies não essenciais não
                compromete o acesso à plataforma, mas pode limitar funcionalidades e a
                personalização de conteúdo.
              </p>
            </div>

            {/* 5. Compartilhamento */}
            <div className="flex flex-col gap-12 py-[44px]">
              <h3>5. Compartilhamento de dados</h3>
              <p>Os dados podem ser compartilhados com:</p>
              <ul className="flex flex-col gap-2 list-none">
                {[
                  ['Empresas do grupo', 'para operação dos serviços'],
                  ['Parceiros e prestadores', 'contratados pela Sociedade'],
                  ['Autoridades e órgãos públicos', 'para cumprimento de obrigações legais ou decisões judiciais'],
                  ['Terceiros envolvidos', 'em eventuais operações societárias (fusões, aquisições etc.)'],
                ].map(([label, desc]) => (
                  <li key={label} className="flex gap-2">
                    <span className="shrink-0">—</span>
                    <span><strong>{label}</strong> {desc}</span>
                  </li>
                ))}
              </ul>
              <p className="">
                Todos os destinatários estão obrigados a adotar boas práticas de segurança da
                informação.
              </p>
              <div className="border border-black/15 rounded-2xl px-6 py-4">
                <p>Dados podem ser transferidos e processados fora do Brasil, inclusive em países
                com legislação menos protetiva.</p>
              </div>
            </div>

            {/* 6. Retenção */}
            <div className="flex flex-col gap-12 py-[44px]">
              <h3>6. Por quanto tempo guardamos seus dados</h3>
              <p>
                Os dados são mantidos enquanto necessários às finalidades descritas ou por exigência
                legal (ex.: Marco Civil da Internet). Após esse prazo, são excluídos com segurança
                ou anonimizados.
              </p>
            </div>

            {/* 7. Direitos */}
            <div className="flex flex-col gap-12 py-[44px]">
              <h3>7. Seus direitos</h3>
              <p>Você pode, a qualquer momento, solicitar ao Encarregado:</p>
              <ul className="flex flex-col gap-2 list-none">
                {[
                  'Confirmação da existência de tratamento',
                  'Acesso aos seus dados',
                  'Correção de dados incorretos',
                  'Exclusão, bloqueio ou anonimização',
                  'Portabilidade para outro fornecedor',
                  'Informações sobre compartilhamento e consentimento',
                  'Revogação de consentimento',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="">
                <strong>Prazo de resposta:</strong> até 15 dias após a solicitação.
              </p>
            </div>

            {/* 8. Responsabilidades */}
            <div className="flex flex-col gap-12 py-[44px]">
              <h3>8. Responsabilidades do Titular</h3>
              <p>
                Ao fornecer dados de terceiros, o Titular declara ter obtido autorização prévia dos
                envolvidos, inclusive de responsáveis legais no caso de menores de idade, e garante
                a veracidade das informações fornecidas.
              </p>
            </div>

            {/* 9. Segurança */}
            <div className="flex flex-col gap-12 py-[44px]">
              <h3>9. Segurança</h3>
              <p>
                A Floux Digital adota medidas técnicas e administrativas para proteger seus dados,
                mas não garante segurança absoluta. Em caso de incidente, a Sociedade tomará as
                providências cabíveis.
              </p>
            </div>

            {/* 10. Alterações */}
            <div className="flex flex-col gap-12 py-[44px]">
              <h3>10. Alterações neste Aviso</h3>
              <p>
                A Sociedade pode atualizar este Aviso a qualquer momento. A versão vigente estará
                sempre disponível na plataforma. O uso continuado dos serviços implica ciência das
                atualizações.
              </p>
            </div>

            {/* 11. Foro */}
            <div className="flex flex-col gap-12 py-[44px]">
              <h3>11. Foro e legislação</h3>
              <p>
                Este Aviso é regido pelas leis brasileiras. Eventuais litígios serão submetidos ao{' '}
                <strong>Foro da Comarca de São Paulo – SP</strong>.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
