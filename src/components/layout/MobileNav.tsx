'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { navLinks } from '@/lib/data'
import Button from '@/components/ui/Button'

const CONTACT_HREF = 'mailto:contato@floux.com.br'

export default function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href.startsWith('#')) return false
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Fixed top bar — mobile only */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 h-[60px] bg-white border-b border-black/5">
        <Link href="/" aria-label="Floux — página inicial">
          <Image src="/floux-black.svg" alt="Floux" width={90} height={37} priority />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={CONTACT_HREF}
            className="bg-accent border border-black/20 text-black text-[13px] font-medium px-4 py-1.5 rounded-full"
          >
            Contato
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            className="p-1 -mr-1"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white flex flex-col pt-[72px] px-6 pb-8">
          <nav aria-label="Menu móvel">
            <ul className="flex flex-col gap-8 mt-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-[2rem] font-light tracking-tight transition-colors ${
                      isActive(link.href) ? 'text-black' : 'text-[#8e8e8e]'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto">
            <Button href={CONTACT_HREF} withArrow external>
              Entre em contato
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
