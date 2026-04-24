'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ChevronUp, ChevronDown } from 'lucide-react'

type Subservice = { slug: string; title: string }

type ServiceAccordionProps = {
  items: { title: string; subservices: Subservice[]; href?: string }[]
}

export default function ServiceAccordion({ items }: ServiceAccordionProps) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <div key={i} className="border-t border-black/10 first:border-t-0">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-8 text-left group"
            aria-expanded={open === i}
          >
            <h3 className="">
              {item.title}
            </h3>
            <span className="shrink-0 ml-4 transition-transform duration-200">
              {open === i ? (
                <ChevronUp size={20} className="text-muted" />
              ) : (
                <ChevronDown size={20} className="text-muted" />
              )}
            </span>
          </button>

          {open === i && item.subservices.length > 0 && (
            <div className="pb-6 flex flex-col gap-2">
              {item.subservices.map((sub) => (
                <div key={sub.slug} className="border-t border-black/5 first:border-t-0">
                  <Link
                    href={`/servicos/${sub.slug}`}
                    className="flex items-center justify-between py-3 text-[1.2rem] lg:text-[1.5rem] font-light text-muted hover:text-black transition-colors group"
                  >
                    <span>{sub.title}</span>
                    <ArrowUpRight
                      size={16}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
