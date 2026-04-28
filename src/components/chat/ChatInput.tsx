'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { useChatContext } from '@/contexts/ChatContext'

export default function ChatInput() {
  const { messages, isLoading, leadSaved, addMessage, setIsLoading, setLeadSaved } = useChatContext()
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return

    setInput('')
    addMessage({ role: 'user', content: text })
    setIsLoading(true)

    try {
      const history = [...messages, { role: 'user' as const, content: text }]
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      const data = await res.json()
      addMessage({ role: 'assistant', content: data.message })
      if (data.leadSaved) setLeadSaved(true)
    } catch {
      addMessage({ role: 'assistant', content: 'Ops, algo deu errado. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="flex pb-6 pt-2 justify-center">
      {leadSaved && (
        <p
          className="text-xs text-[#8e8e8e] text-center mb-2"
          style={{ fontFamily: 'var(--font-open-sans)' }}
        >
          Seus dados foram salvos. Nossa equipe entrará em contato em breve.
        </p>
      )}
      <form onSubmit={handleSubmit} className='w-full'>
        <div className="flex items-center max-w-[690px] mx-auto padding-x">
          <div className="flex items-end bg-[#e2e2e2] w-full rounded-[24px] pl-5 pr-[4px] py-[4px]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite aqui"
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none overflow-hidden bg-transparent border-0 outline-none leading-6 placeholder:text-[#8e8e8e] disabled:opacity-50 py-[10px]"
              style={{
                fontFamily: 'var(--font-open-sans)',
                fontSize: '18px',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="shrink-0 w-10 h-10  mr-[2px] mb-[2px] rounded-[20px] bg-accent border border-black/25 flex items-center justify-center disabled:opacity-30 transition-opacity hover:opacity-80 cursor-pointer"
            >
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
