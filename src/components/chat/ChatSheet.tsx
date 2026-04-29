'use client'

import { useEffect, useRef } from 'react'
import { Drawer } from 'vaul'
import { X } from 'lucide-react'
import { useChatContext } from '@/contexts/ChatContext'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'

export default function ChatSheet() {
  const { isOpen, setIsOpen } = useChatContext()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport || !contentRef.current) return

    function onResize() {
      if (!contentRef.current) return
      const keyboardHeight = window.innerHeight - (viewport?.height ?? window.innerHeight)
      contentRef.current.style.paddingBottom = keyboardHeight > 0 ? `${keyboardHeight}px` : ''
    }

    viewport.addEventListener('resize', onResize)
    return () => viewport.removeEventListener('resize', onResize)
  }, [isOpen])

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content
          ref={contentRef}
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white rounded-tl-[24px] rounded-tr-[24px] outline-none"
          style={{ height: '85dvh', maxHeight: '85dvh' }}
        >
          <Drawer.Title className="sr-only">Floux by Jeff Monteiro</Drawer.Title>

          <div className="w-full justify-center mx-auto flex flex-col flex-1 overflow-hidden">
            {/* Drag handle */}
            <div className="flex justify-center pt-4 pb-1">
              <div className="w-[36px] h-[3px] rounded-full bg-black/20" />
            </div>

            {/* Header */}
            <div className="grid grid-cols-[40px_1fr_40px] padding-x py-3">
              <div />
              <p className="text-base font-semibold leading-8 text-center text-black">
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 bg-white border border-black/25 rounded-full flex items-center justify-center hover:opacity-60 transition-opacity cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages area with top gradient */}
            <div className="relative flex justify-center flex-1 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
              <ChatMessages />
            </div>

            <ChatInput />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
