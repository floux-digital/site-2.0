import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

const footerLinks = [
  { label: 'Sobre', href: '/sobre' },
  { label: 'Serviços', href: '/servicos' },
  { label: 'Cases', href: '/cases' },
  { label: 'Privacidade', href: '/privacidade' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="contato" className="border-t border-black/5 pt-16 pb-10 px-6 lg:px-0">
      <div className="max-w-[1920px] mx-auto lg:pl-[240px]">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 px-4 lg:px-6">
          {/* CTA left */}
          <div className="flex-1">
            <h2 className="text-[3rem] lg:text-h2 font-light tracking-h2 leading-h2 mb-10">
              Vamos juntos?
            </h2>
            <ul className="flex flex-col gap-1">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[20px] lg:text-[24px] font-light tracking-tight leading-12 hover:opacity-60 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact button right */}
          <div className="shrink-0">
            <a
              href="mailto:contato@floux.com.br"
              className="inline-flex items-center gap-3 bg-black text-white font-medium text-[20px] pl-6 pr-1 py-1 rounded-full hover:opacity-80 transition-opacity"
            >
              <span>Entre em contato</span>
              <span className="flex items-center justify-center w-11 h-11 rounded-full bg-accent">
                <ArrowUpRight size={18} strokeWidth={2} className="text-black" />
              </span>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex items-end justify-between px-4 lg:px-6">
          <Image
            src="/floux-black.svg"
            alt="Floux"
            width={100}
            height={41}
            className="opacity-80"
          />
          <p className="text-[14px] font-light text-muted">
            ©2003-{year}
          </p>
        </div>
      </div>
    </footer>
  )
}
