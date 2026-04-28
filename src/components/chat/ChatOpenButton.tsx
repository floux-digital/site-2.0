'use client'

import { useChatContext } from '@/contexts/ChatContext'

type Props = {
  children: React.ReactNode
  className?: string
  onBeforeOpen?: () => void
  delay?: number
}

export default function ChatOpenButton({ children, className, onBeforeOpen, delay = 0 }: Props) {
  const { setIsOpen } = useChatContext()

  function handleClick() {
    if (onBeforeOpen) onBeforeOpen()
    if (delay > 0) {
      setTimeout(() => setIsOpen(true), delay)
    } 
    else {
      setIsOpen(true)
    }
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  )
}
