'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Button from '@/components/ui/Button'

export type AccordionItem = {
  title: string
  body: string
  href?: string
  hrefLabel?: string
}

type AccordionProps = {
  items: AccordionItem[]
  defaultOpen?: number | null
}

export default function Accordion({ items, defaultOpen = 0 }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(defaultOpen)

  return (
    <div className="flex flex-col">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.title} className="border-b border-black/25">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between py-8 text-left"
              aria-expanded={isOpen}
            >
              <h3>{item.title}</h3>
              <span className="shrink-0 ml-4 transition-transform duration-300">
                {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </span>
            </button>

            <div
              className="grid"
              style={{
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: 'grid-template-rows 300ms ease-in-out',
              }}
            >
              <div className="overflow-hidden min-h-0">
                <div className="pb-[44px] flex flex-col gap-[44px]">
                  <p className="max-w-[500px]">{item.body}</p>
                  {item.href && (
                    <Button href={item.href} withArrow>
                      {item.hrefLabel ?? 'Saiba Mais'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
