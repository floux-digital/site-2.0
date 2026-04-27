'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { getCookieConsent } from '@/components/ui/CookieBanner'

export default function MetaPixel({ id }: { id: string }) {
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
  return (
    <Script id="meta-pixel" strategy="afterInteractive">{`
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${id}');
      fbq('track', 'PageView');
    `}</Script>
  )
}
