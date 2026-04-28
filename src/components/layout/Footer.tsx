import Link from 'next/link'
import Image from 'next/image'
import FooterInput from '@/components/chat/FooterInput'

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

          <div className="flex-1">
            <h2 className="max-w-[300px] lg:max-w-[400px] xl:max-w-[900px]">
              Tudo bem?
            </h2>
          </div>

          {/* Footer input — opens chat with question pre-sent */}
          <div className="pb-[44px]">
            <FooterInput />
          </div>

          {/* Nav links */}
          <nav aria-label="Rodapé">
            <ul className="flex flex-col gap-[22px] pl-[24px]">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-light text-base leading-8 hover:opacity-60 transition-opacity"
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
            <span className="font-light text-[18px] text-black">©2023-{year}</span>
          </div>

        </div>
      </div>
    </footer>
  )
}
