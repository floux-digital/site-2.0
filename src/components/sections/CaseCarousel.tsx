'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { cases } from '@/lib/data'

export default function CaseCarousel() {
  const ref = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return
    ref.current.scrollBy({ left: dir === 'left' ? -440 : 440, behavior: 'smooth' })
  }

  return (
    <section className="py-10 lg:py-14">
      {/* Scrollable cards */}
      <div
        ref={ref}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 px-4 lg:px-6 no-scrollbar"
      >
        {cases.map((c) => (
          <div
            key={c.slug}
            className="shrink-0 snap-start w-[85vw] sm:w-[420px] lg:w-[calc(50%-24px)] rounded-3xl overflow-hidden bg-card aspect-video relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {/* Placeholder for case image */}
            <div className="w-full h-full flex items-end p-6">
              <span className="text-muted text-sm font-medium">{c.client}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3 mt-4 px-4 lg:px-6">
        <button
          onClick={() => scroll('left')}
          aria-label="Slide anterior"
          className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll('right')}
          aria-label="Próximo slide"
          className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

    </section>
  )
}
