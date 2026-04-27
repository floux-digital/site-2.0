'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import FlImage from '@/components/ui/FlImage'
import { cases as allCases } from '@/lib/data'

type Case = typeof allCases[number]

export default function CaseCarousel({ cases = allCases }: { cases?: Case[] }) {
  const ref = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return
    ref.current.scrollBy({ left: dir === 'left' ? -344 : 344, behavior: 'smooth' })
  }

  return (
    <section className='py-[66px]'>
      {/* Scrollable cards — portrait 320×388 */}
      <div
        ref={ref}
        className="flex gap-6 overflow-x-auto no-scrollbar px-4 lg:px-[44px] py-6"
      >
        {cases.map((c) => (
          <Link
            key={c.slug}
            href={`/cases/${c.slug}`}
            className="shrink-0 w-[280px] lg:w-[320px] h-[388px] rounded-3xl bg-card relative group overflow-hidden"
          >
            <FlImage src={c.image || undefined} alt={c.title} fill />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="absolute bottom-6 left-6 text-muted text-sm font-medium">
              {c.client}
            </span>
          </Link>
        ))}
      </div>

      {/* Controls — buttons aligned to content column start (sideSpacer + gap) */}
      <div className="flex items-center px-4 lg:px-[44px] py-[22px] gap-4">
        <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
        <button
          onClick={() => scroll('left')}
          aria-label="Slide anterior"
          className="w-10 h-10 rounded-[20px] border border-black/25 flex items-center justify-center hover:bg-black hover:text-white transition-colors shrink-0"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => scroll('right')}
          aria-label="Próximo slide"
          className="w-10 h-10 rounded-[20px] border border-black/25 flex items-center justify-center hover:bg-black hover:text-white transition-colors shrink-0"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  )
}
