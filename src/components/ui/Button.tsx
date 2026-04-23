'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

type ButtonProps = {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'accent' | 'ghost'
  withArrow?: boolean
  className?: string
  external?: boolean
}

export default function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  withArrow = false,
  className = '',
  external = false,
}: ButtonProps) {
  const base =
    'inline-flex items-center gap-3 rounded-full font-medium text-[20px] leading-none transition-opacity hover:opacity-80 cursor-pointer'

  const variants = {
    primary: 'bg-black text-white px-6 py-3.5',
    accent: 'bg-accent text-black border border-black/20 px-5 py-2.5 text-base',
    ghost: 'bg-transparent text-black px-5 py-2.5 text-base',
  }

  const classes = `${base} ${variants[variant]} ${className}`

  const content = (
    <>
      <span>{children}</span>
      {withArrow && (
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-accent shrink-0">
          <ArrowUpRight size={18} strokeWidth={2} className="text-black" />
        </span>
      )}
    </>
  )

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {content}
        </a>
      )
    }
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  )
}
