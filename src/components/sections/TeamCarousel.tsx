'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import FlImage from '@/components/ui/FlImage'
import { team } from '@/lib/data'

export default function TeamCarousel() {
  const ref = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return
    ref.current.scrollBy({ left: dir === 'left' ? -440 : 440, behavior: 'smooth' })
  }

  return (
    <section className="py-[66px]">
      <div
        ref={ref}
        className="flex gap-6 overflow-x-auto no-scrollbar px-4 lg:px-[44px] py-6"
      >
        {team.map((member) => (
          <div key={member.name} className="shrink-0 snap-start w-[280px] lg:w-[380px]">
            <div className="relative w-full aspect-square mb-4">
              <FlImage src={member.pic || undefined} alt={member.name} fill />
            </div>
            {/* Name card */}
            <div className="bg-card-dark rounded-2xl px-[24px] py-[24px] flex flex-col">
              <span className="font-medium leading-none">{member.name}</span>
              <span className="text-[13px] font-light">{member.title}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-4 px-[22px] lg:px-[44px]">
        <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
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
