'use client'

/**
 * CookieBanner — Consentimento de cookies não essenciais (LGPD)
 *
 * Aparece automaticamente na primeira visita (canto inferior direito).
 * A escolha é salva em localStorage e persiste entre sessões.
 *
 * ─── LENDO O CONSENTIMENTO EM OUTROS COMPONENTES ────────────────────────────
 *
 *   import { getCookieConsent } from '@/components/ui/CookieBanner'
 *
 *   const consent = getCookieConsent()  // 'accepted' | 'rejected' | null
 *   if (consent === 'accepted') { ... }
 *
 * ─── GOOGLE ANALYTICS ───────────────────────────────────────────────────────
 *
 *   Crie src/components/analytics/GoogleAnalytics.tsx ('use client'):
 *
 *   import { useEffect } from 'react'
 *   import Script from 'next/script'
 *   import { getCookieConsent } from '@/components/ui/CookieBanner'
 *
 *   export default function GoogleAnalytics({ id }: { id: string }) {
 *     const allowed = getCookieConsent() === 'accepted'
 *     if (!allowed) return null
 *     return (
 *       <>
 *         <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
 *         <Script id="gtag-init">{`
 *           window.dataLayer = window.dataLayer || [];
 *           function gtag(){dataLayer.push(arguments);}
 *           gtag('js', new Date());
 *           gtag('config', '${id}');
 *         `}</Script>
 *       </>
 *     )
 *   }
 *
 *   // Em layout.tsx: <GoogleAnalytics id="G-XXXXXXXXXX" />
 *
 * ─── META PIXEL ─────────────────────────────────────────────────────────────
 *
 *   Crie src/components/analytics/MetaPixel.tsx ('use client'):
 *
 *   import Script from 'next/script'
 *   import { getCookieConsent } from '@/components/ui/CookieBanner'
 *
 *   export default function MetaPixel({ id }: { id: string }) {
 *     if (getCookieConsent() !== 'accepted') return null
 *     return (
 *       <Script id="meta-pixel">{`
 *         !function(f,b,e,v,n,t,s){...}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
 *         fbq('init', '${id}');
 *         fbq('track', 'PageView');
 *       `}</Script>
 *     )
 *   }
 *
 *   // Em layout.tsx: <MetaPixel id="000000000000000" />
 *
 * ─── FORÇAR NOVA EXIBIÇÃO (dev / testes) ────────────────────────────────────
 *
 *   No console do navegador:
 *   localStorage.removeItem('floux_cookie_consent')
 *   location.reload()
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'

export const COOKIE_CONSENT_KEY = 'floux_cookie_consent'

export type CookieConsent = 'accepted' | 'rejected'

/** Lê a preferência salva. Retorna null se o usuário ainda não decidiu. */
export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(COOKIE_CONSENT_KEY) as CookieConsent | null
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_CONSENT_KEY)) setVisible(true)
  }, [])

  const handle = (value: CookieConsent) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, value)
    window.dispatchEvent(new CustomEvent('cookieConsent', { detail: value }))
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Consentimento de cookies"
      aria-live="polite"
      className="fixed bottom-6 right-4 lg:right-6 z-50 w-[min(320px,calc(100vw-32px))] bg-white border border-black/10 rounded-3xl shadow-xl p-6 flex flex-col gap-6"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(1rem)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 400ms ease, transform 400ms ease',
      }}
    >
      <p className="!text-sm leading-relaxed">
        Podemos usar cookies de terceiros para melhorar sua experiência?<br/>
      </p>

      <Link
          href="/privacidade"
          className="!text-sm underline underline-offset-2 hover:opacity-60 transition-opacity"
        >
          Saiba mais
      </Link>

      <div className="flex gap-3">
        <button
          onClick={() => handle('accepted')}
          className="flex-1 bg-black text-white text-sm font-medium h-10 rounded-full hover:opacity-80 transition-opacity"
        >
          Aceitar
        </button>
        <button
          onClick={() => handle('rejected')}
          className="flex-1 border border-black/20 text-black text-sm font-medium h-10 rounded-full hover:opacity-60 transition-opacity"
        >
          Rejeitar
        </button>
      </div>
    </div>
  )
}
