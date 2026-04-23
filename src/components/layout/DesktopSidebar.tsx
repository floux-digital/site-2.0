'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { navLinks } from '@/lib/data'

export default function DesktopSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href.startsWith('#')) return false
    return pathname.startsWith(href)
  }

  return (
    <aside
      id="main-sidebar"
      className="hidden lg:flex flex-col w-[240px] shrink-0 px-6 pt-20 pb-10 self-start"
    >
      <Link href="/" aria-label="Floux — página inicial" className="mb-10 inline-block">
        <Image
          src="/floux-black.svg"
          alt="Floux"
          width={140}
          height={58}
          priority
        />
      </Link>

      <nav aria-label="Navegação principal">
        <ul className="flex flex-col gap-0.5">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block text-[15px] font-medium leading-9 transition-colors ${
                  isActive(link.href) ? 'text-black' : 'text-[#8e8e8e] hover:text-black'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
