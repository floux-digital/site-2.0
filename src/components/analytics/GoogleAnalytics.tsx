'use client'

import { useEffect, useState } from 'react'
import { GoogleAnalytics as GAScript } from '@next/third-parties/google'
import { getCookieConsent } from '@/components/ui/CookieBanner'

export default function GoogleAnalytics({ id }: { id: string }) {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (getCookieConsent() === 'accepted') setAllowed(true)

    const handler = (e: Event) => {
      if ((e as CustomEvent<string>).detail === 'accepted') setAllowed(true)
    }
    window.addEventListener('cookieConsent', handler)
    return () => window.removeEventListener('cookieConsent', handler)
  }, [])

  if (!allowed) return null
  return <GAScript gaId={id} />
}
