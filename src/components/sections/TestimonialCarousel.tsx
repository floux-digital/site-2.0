'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { testimonials } from '@/lib/data'

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  const next = () => setCurrent((c) => (c + 1) % testimonials.length)

  return (
    <section className="py-20 lg:py-28">
      <h2 className="text-[2.5rem] lg:text-h2 font-light tracking-h2 leading-h2 mb-16 px-4 lg:px-6">
        Experiência posta à prova
      </h2>

      <div className="relative">
        {/* Cards */}
        <div className="flex gap-6 overflow-hidden px-4 lg:px-6">
          {testimonials.map((t, i) => {
            const isActive = i === current
            return (
              <div
                key={i}
                className={`border border-black/20 rounded-3xl p-8 flex flex-col justify-between min-h-[360px] transition-all duration-300 shrink-0 ${
                  isActive
                    ? 'w-full lg:w-[calc(50%-12px)]'
                    : 'hidden lg:flex w-[calc(25%-18px)] opacity-40'
                }`}
              >
                <p className="text-[18px] lg:text-body-lg font-light leading-body-lg flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-card shrink-0" />
                  <div>
                    <p className="font-medium text-[18px]">{t.name}</p>
                    <p className="text-[14px] font-light text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Controls */}
        <div className="flex gap-3 mt-8 px-4 lg:px-6">
          <button
            onClick={prev}
            aria-label="Depoimento anterior"
            className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            aria-label="Próximo depoimento"
            className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}
