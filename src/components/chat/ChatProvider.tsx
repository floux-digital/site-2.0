'use client'

import { ChatContextProvider } from '@/contexts/ChatContext'
import ChatSheet from './ChatSheet'

export default function ChatProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChatContextProvider>
      {children}
      <ChatSheet />
    </ChatContextProvider>
  )
}
