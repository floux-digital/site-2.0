'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import FlImage from '@/components/ui/FlImage'
import { testimonials } from '@/lib/data'

export default function TestimonialCarousel() {
  const ref = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return
    ref.current.scrollBy({ left: dir === 'left' ? -344 : 344, behavior: 'smooth' })
  }

  return (
    <section className='py-[66px]'>
      {/* Cards */}
      <div
        ref={ref}
        className="flex gap-6 overflow-x-auto no-scrollbar px-4 lg:px-[44px] py-6"
      >
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="shrink-0 w-[320px] lg:w-[460px] border border-black/25 rounded-3xl px-6 py-[22px] flex flex-col gap-[44px]"
          >
            {/* Logo + review text */}
            <div className="flex-1 flex-col gap-4">
              {t.companyLogo ? (
                <img
                  src={t.companyLogo}
                  alt={t.company}
                  loading="lazy"
                  className="h-[50px] w-[137px] object-contain mb-4"
                />
              ) : (
                <div className="h-[50px] w-[137px] bg-card rounded-lg flex items-center mb-4 px-3">
                  <span className="text-[13px] font-medium text-muted">{t.company}</span>
                </div>
              )}
              <p className="text-[16px] font-light leading-8 text-black">
                &ldquo;{t.text}&rdquo;
              </p>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-[22px]">
              <div className="relative w-[63px] h-[63px] rounded-full overflow-hidden shrink-0">
                <FlImage src={t.avatar || undefined} alt={t.name} fill />
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-semibold leading-8">{t.name}</span>
                <span className="text-[14px] font-light text-muted">{t.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls — buttons aligned to content column start */}
      <div className="flex items-center px-4 lg:px-[44px] py-[22px] gap-4">
        <div className="hidden lg:block w-[335px] shrink-0" aria-hidden />
        <button
          onClick={() => scroll('left')}
          aria-label="Depoimento anterior"
          className="w-10 h-10 rounded-[20px] border border-black/25 flex items-center justify-center hover:bg-black hover:text-white transition-colors shrink-0"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => scroll('right')}
          aria-label="Próximo depoimento"
          className="w-10 h-10 rounded-[20px] border border-black/25 flex items-center justify-center hover:bg-black hover:text-white transition-colors shrink-0"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  )
}
