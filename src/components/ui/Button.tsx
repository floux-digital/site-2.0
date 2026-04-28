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
    'inline-flex items-center gap-4 font-medium text-[18px] leading-none transition-opacity hover:opacity-80 cursor-pointer w-fit'

  const variants = {
    primary:
      'bg-black text-white h-14 rounded-[28px] pl-6 pr-[10px] py-[6px] border border-black/25',
    accent:
      'bg-accent text-black border border-black/20 padding-x py-2.5 text-base rounded-full',
    ghost: 'bg-transparent text-black padding-x py-2.5 text-base rounded-full',
  }

  const classes = `${base} ${variants[variant]} ${className}`

  const content = (
    <>
      <span>{children}</span>
      {withArrow && (
        <span className="flex items-center justify-center w-10 h-10 rounded-[20px] bg-accent border border-black/25 shrink-0">
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
