import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

const footerLinks = [
  { label: 'Sobre', href: '/sobre' },
  { label: 'Serviços', href: '/servicos' },
  { label: 'Cases', href: '/cases' },
  { label: 'Artigos', href: '/artigos' },
  { label: 'Privacidade', href: '/privacidade' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="contato" className="padding-x py-[88px]">
      <div className="flex flex-col lg:flex-row lg:items-start">
        <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
        <div className="w-full max-w-[900px] flex flex-col gap-[44px]">
          {/* Heading + CTA inline */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 pb-[44px]">
            <h2 className="flex-1">
              Vamos juntos?
            </h2>
            <a
              href="mailto:contato@floux.com.br"
              className="w-fit inline-flex items-center gap-4 bg-black text-white font-medium text-[18px] h-14 rounded-[28px] pl-6 pr-[10px] py-[6px] border border-black/25 hover:opacity-80 transition-opacity shrink-0"
            >
              <span>Entre em contato</span>
              <span className="flex items-center justify-center w-10 h-10 rounded-[20px] bg-accent border border-black/25 shrink-0">
                <ArrowUpRight size={18} strokeWidth={2} className="text-black" />
              </span>
            </a>
          </div>

          {/* Nav links */}
          <nav aria-label="Rodapé">
            <ul className="flex flex-col gap-[22px]">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:opacity-60 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logo + copyright */}
          <div className="flex items-center gap-6 pt-[88px]">
            <Image
              src="/floux-black.svg"
              alt="Floux"
              width={100}
              height={25}
            />
            <span className="text-[18px] font-light text-black">©2003-{year}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
