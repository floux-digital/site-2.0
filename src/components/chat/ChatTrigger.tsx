'use client'

import { MessageCircle } from 'lucide-react'
import { useChatContext } from '@/contexts/ChatContext'

export default function ChatTrigger() {
  const { setIsOpen, isOpen } = useChatContext()

  if (isOpen) return null

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-lg hover:opacity-80 transition-opacity cursor-pointer"
      aria-label="Abrir chat"
    >
      <MessageCircle size={24} />
    </button>
  )
}
