'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { navLinks } from '@/lib/data'
import { useChatContext } from '@/contexts/ChatContext'

export default function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [rendered, setRendered] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { setIsOpen: openChat } = useChatContext()

  const openMenu = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setRendered(true)
    // 50ms garante a renderização em dispositivos móveis mais lentos (Android) antes da transição
    setTimeout(() => setOpen(true), 50)
  }, [])

  const closeMenu = useCallback(() => {
    setOpen(false)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      setRendered(false)
      closeTimer.current = null
    }, 350)
  }, [])

  useEffect(() => { closeMenu() }, [pathname, closeMenu])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href.startsWith('#')) return false
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Fixed top bar — mobile only */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between padding-x py-[22px] bg-white border-b border-black/5">
        <Link href="/" aria-label="Floux — página inicial" className="shrink-0">
          <Image src="/floux-by-jeff-bk.svg" alt="Floux" width={240} height={88} style={{ width: '110px', height: 'auto' }} />
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openChat(true)}
            className="bg-accent border border-black/20 text-black text-[13px] font-medium padding-x py-1.5 rounded-full cursor-pointer"
          >
            Contato
          </button>
          <button
            type="button"
            onClick={openMenu}
            aria-label="Abrir menu"
            aria-expanded={open}
            className="w-10 h-10 rounded-full border border-black/25 flex items-center justify-center shrink-0 transition-opacity hover:opacity-70 [&>svg]:pointer-events-none"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Full-screen drawer — mounted only when needed, unmounted after exit animation */}
      {rendered && (
        <div
          className={`lg:hidden fixed inset-0 z-50 flex flex-col bg-black transition-[opacity,transform] duration-300 ease-in-out ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
            }`}
          aria-hidden={!open}
        >
          {/* Header: logo + close button */}
          <div className="flex items-center justify-between px-[22px] py-[22px] shrink-0">
            <Link href="/" onClick={closeMenu} aria-label="Floux — página inicial" className="shrink-0">
              <Image src="/floux-white.svg" alt="Floux" width={1049} height={258} style={{ width: '110px', height: 'auto' }} />
            </Link>
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Fechar menu"
              className="w-10 h-10 rounded-full bg-white border border-black/25 flex items-center justify-center shrink-0 transition-opacity hover:opacity-70 [&>svg]:pointer-events-none"
            >
              <X size={18} className="text-black" />
            </button>
          </div>

          {/* Spacer pushes nav links toward center/bottom */}
          <div className="flex-1" />

          {/* Nav links */}
          <nav aria-label="Menu móvel" className="px-[22px] pb-[44px]">
            <ul className="flex flex-col gap-[44px]">
              {navLinks.map((link, i) => (
                <li
                  key={link.href}
                  className={`transition-[opacity,transform] duration-300 ease-out ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                    }`}
                  style={{ transitionDelay: open ? `${60 + i * 50}ms` : '0ms' }}
                >
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className={`block text-[16px] font-light leading-[32px] tracking-[0.05em] uppercase transition-colors ${isActive(link.href) ? 'text-white' : 'text-muted'
                      }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA */}
          <div className="px-[22px] pb-[22px] shrink-0">
            <button
              type="button"
              onClick={() => { closeMenu(); setTimeout(() => openChat(true), 320) }}
              className="block w-full text-center bg-accent border border-black/25 text-black text-[16px] font-medium py-[10px] rounded-[22px] transition-opacity hover:opacity-80 cursor-pointer"
            >
              Entre em contato
            </button>
          </div>
        </div>
      )}
    </>
  )
}
