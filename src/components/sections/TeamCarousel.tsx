'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { team } from '@/lib/data'

export default function TeamCarousel() {
  const ref = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return
    ref.current.scrollBy({ left: dir === 'left' ? -440 : 440, behavior: 'smooth' })
  }

  return (
    <section className="py-10">
      <div
        ref={ref}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 px-4 lg:px-6 no-scrollbar"
      >
        {team.map((member) => (
          <div key={member.name} className="shrink-0 snap-start w-[280px] lg:w-[380px]">
            {/* Photo placeholder */}
            <div className="w-full aspect-square rounded-3xl bg-card mb-4" />
            {/* Name card */}
            <div className="bg-card-dark rounded-2xl px-4 py-4">
              <p className="font-medium text-[18px]">{member.name}</p>
              <p className="text-[13px] font-light text-muted mt-0.5">{member.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-4 px-4 lg:px-6">
        <button
          onClick={() => scroll('left')}
          aria-label="Membro anterior"
          className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll('right')}
          aria-label="Próximo membro"
          className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  )
}
