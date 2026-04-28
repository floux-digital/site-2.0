'use client'

import { createContext, useContext, useState } from 'react'

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
  addMessage: (message: Omit<Message, 'id'>) => void
  setIsOpen: (open: boolean) => void
  setIsLoading: (loading: boolean) => void
  setLeadSaved: (saved: boolean) => void
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatContextProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', role: 'assistant', content: 'Para começar, como posso te chamar?' },
  ])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [leadSaved, setLeadSaved] = useState(false)

  function addMessage(message: Omit<Message, 'id'>) {
    setMessages((prev) => [
      ...prev,
      { ...message, id: `${Date.now()}-${Math.random()}` },
    ])
  }

  return (
    <ChatContext.Provider
      value={{ messages, isOpen, isLoading, leadSaved, addMessage, setIsOpen, setIsLoading, setLeadSaved }}
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
