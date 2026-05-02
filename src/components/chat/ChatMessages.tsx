'use client'

import { useEffect, useRef } from 'react'
import { useChatContext } from '@/contexts/ChatContext'

const OPEN_SANS: React.CSSProperties = {
  fontFamily: 'var(--font-open-sans)',
  fontSize: '18px',
  lineHeight: '24px',
}

export default function ChatMessages() {
  const { messages, isLoading } = useChatContext()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const isInitialOnly = messages.length === 1 && messages[0].id === 'initial'

  return (
    <div className={`flex flex-col h-full overflow-y-auto padding-x overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-6 pb-4 space-y-3 w-full max-w-[674px] ${isInitialOnly ? 'justify-center' : ''}`}>
      {!isInitialOnly && <div className="flex-1 min-h-0" />}
      {messages.map((msg) => {
        if (msg.id === 'initial') {
          return (
            <p
              key={msg.id}
              className={`text-black ${isInitialOnly ? 'mb-4' : 'mb-6'}`}
              style={{
                fontSize: '36px',
                lineHeight: '44px',
                letterSpacing: '-1.8px',
                fontFamily: 'var(--font-poppins)',
                fontWeight: 400,
              }}
            >
              {msg.content}
            </p>
          )
        }

        return (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'user' ? (
              <div
                className="max-w-[75%] bg-black text-white rounded-[8px] px-4 py-3 text-right"
                style={OPEN_SANS}
              >
                {msg.content}
              </div>
            ) : (
              <div
                className="max-w-[80%] bg-white text-black rounded-[8px] py-3"
                style={OPEN_SANS}
              >
                {msg.content}
              </div>
            )}
          </div>
        )
      })}

      {isLoading && (
        <div className="flex justify-start px-4 py-3">
          <span className="flex gap-[3px] items-end">
            <span className="w-[7px] h-[7px] rounded-full bg-black/30 animate-bounce [animation-delay:0ms]" />
            <span className="w-[7px] h-[7px] rounded-full bg-black/30 animate-bounce [animation-delay:150ms]" />
            <span className="w-[7px] h-[7px] rounded-full bg-black/30 animate-bounce [animation-delay:300ms]" />
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
