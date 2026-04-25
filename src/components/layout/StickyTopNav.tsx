'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { navLinks } from '@/lib/data'

const CONTACT_HREF = 'mailto:contato@floux.com.br'

export default function StickyTopNav() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const sidebarInView = useRef(true)
  const lastY = useRef(0)
  const rafId = useRef<number | null>(null)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href.startsWith('#')) return false
    return pathname.startsWith(href)
  }

  useEffect(() => {
    setVisible(false)
    sidebarInView.current = true
    lastY.current = window.scrollY

    const sidebar = document.getElementById('main-sidebar')
    if (!sidebar) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        sidebarInView.current = entry.isIntersecting
        if (entry.isIntersecting) setVisible(false)
      },
      { threshold: 0 }
    )
    observer.observe(sidebar)

    const onScroll = () => {
      if (rafId.current) return
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null
        const y = window.scrollY
        const scrollingUp = y < lastY.current
        lastY.current = y

        if (!sidebarInView.current && scrollingUp) {
          setVisible(true)
        } else if (!scrollingUp) {
          setVisible(false)
        }
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [pathname])

  return (
    // Outer wrapper: fixed full-width, provides the 30px lateral margins and 27px top offset
    <div
      aria-hidden={!visible}
      className={`hidden lg:block fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Pill: black, rounded-[64px], 30px margin each side, 27px from top, 82px tall */}
      <div className="mx-[30px] mt-[27px] bg-black rounded-[64px] h-[82px] flex items-center px-8 gap-4">
        {/* Logo — white version on black background */}
        <Link href="/" aria-label="Floux" className="shrink-0">
          <Image src="/floux-white.svg" alt="Floux" width={100} height={41} />
        </Link>

        {/* Nav links — centered */}
        <nav aria-label="Navegação global" className="flex-1 flex justify-center">
          <ul className="flex gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`!text-[15px] font-medium transition-colors ${
                    isActive(link.href) ? 'text-white' : 'text-[#8e8e8e] hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* CTA button — green, right side */}
        <Link
          href={CONTACT_HREF}
          className="shrink-0 bg-accent border border-white/20 text-black !text-[14px] font-medium px-5 py-2 rounded-full hover:opacity-80 transition-opacity"
        >
          Entre em contato
        </Link>
      </div>
    </div>
  )
}
