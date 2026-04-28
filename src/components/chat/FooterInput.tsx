'use client'

import { useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { useChatContext } from '@/contexts/ChatContext'

export default function FooterInput() {
  const { sendMessage, setIsOpen, isLoading } = useChatContext()
  const [input, setInput] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input
    setInput('')
    setIsOpen(true)
    await sendMessage(text)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white border-4 border-black rounded-[44px] pl-8 pr-[4px] py-[4px] flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Responda aqui"
          className="w-full bg-transparent outline-none text-xl text-black placeholder:text-black/40 leading-6"
          style={{ fontFamily: 'var(--font-poppins)', fontWeight: 400 }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="shrink-0 w-14 h-14 rounded-[30px] bg-accent border border-black/25 flex items-center justify-center disabled:opacity-30 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <ArrowUp size={24} strokeWidth={2.5} />
        </button>
      </div>
    </form>
  )
}
