'use client'

import { createContext, useContext, useState, useRef } from 'react'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type ChatContextType = {
  messages: Message[]
  isOpen: boolean
  isLoading: boolean
  leadSaved: boolean
  setIsOpen: (open: boolean) => void
  sendMessage: (text: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatContextProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', role: 'assistant', content: 'Para começar, como posso te chamar?' },
  ])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [leadSaved, setLeadSaved] = useState(false)

  // Ref keeps latest messages accessible inside async sendMessage without stale closure
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const isLoadingRef = useRef(isLoading)
  isLoadingRef.current = isLoading

  function addMessage(message: Omit<Message, 'id'>) {
    setMessages((prev) => [
      ...prev,
      { ...message, id: `${Date.now()}-${Math.random()}` },
    ])
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isLoadingRef.current) return

    addMessage({ role: 'user', content: trimmed })
    setIsLoading(true)

    try {
      const history = [
        ...messagesRef.current,
        { role: 'user' as const, content: trimmed },
      ]
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

  return (
    <ChatContext.Provider
      value={{ messages, isOpen, isLoading, leadSaved, setIsOpen, sendMessage }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatContext must be used inside ChatContextProvider')
  return ctx
}
