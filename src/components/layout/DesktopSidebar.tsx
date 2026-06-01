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
      className="hidden lg:flex flex-col w-[335px] shrink-0 py-[22px] gap-[44px] self-start"
    >
      <Link href="/" aria-label="Floux — página inicial" className="inline-block">
        <Image
          src="/floux-by-jeff-bk.svg"
          alt="Floux"
          width={240}
          height={88}
          style={{ width: '160px', height: 'auto' }}
        />
      </Link>

      <nav aria-label="Navegação principal">
        <ul className="flex flex-col gap-[5px]">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block !text-[16px] font-medium leading-8 transition-colors ${
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
