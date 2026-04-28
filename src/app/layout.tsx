import type { Metadata } from 'next'
import { Poppins, Open_Sans } from 'next/font/google'
import './globals.css'
import MobileNav from '@/components/layout/MobileNav'
import StickyTopNav from '@/components/layout/StickyTopNav'
import Footer from '@/components/layout/Footer'
import CookieBanner from '@/components/ui/CookieBanner'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import MetaPixel from '@/components/analytics/MetaPixel'
import { organizationSchema, webSiteSchema } from '@/lib/schema'
import ChatProvider from '@/components/chat/ChatProvider'
import ChatOpenButton from '@/components/chat/ChatOpenButton'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-open-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://floux.com.br'),
  title: {
    default: 'Floux — Consultoria de design e tecnologia para negócios',
    template: '%s | Floux',
  },
  description:
    'Criamos experiências que entregam valor para seus clientes e crescimento para o seu negócio. Design strategy, UX research, product design e outsourcing.',
  keywords: [
    'consultoria de design',
    'UX design',
    'product design',
    'service design',
    'design strategy',
    'outsourcing de design',
    'UX research',
    'crescimento de negócios',
    'design São Paulo',
  ],
  authors: [{ name: 'Floux', url: 'https://floux.com.br' }],
  creator: 'Floux',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://floux.com.br',
    siteName: 'Floux',
    title: 'Floux — Consultoria de design e tecnologia para negócios',
    description:
      'Criamos experiências que entregam valor para seus clientes e crescimento para o seu negócio.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Floux — Consultoria de design e tecnologia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Floux — Consultoria de design e tecnologia para negócios',
    description:
      'Criamos experiências que entregam valor para seus clientes e crescimento para o seu negócio.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://floux.com.br',
    languages: { 'pt-BR': 'https://floux.com.br' },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${openSans.variable} scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema()) }}
        />
      </head>
      <body className="antialiased">
        <ChatProvider>
          {/* Mobile fixed top bar */}
          <MobileNav />

          {/*
            Desktop contact button — full-width row, top-right.
            Sits above <main> so it's outside any flex/sidebar layout.
          */}
          <div className="hidden lg:flex justify-end px-[44px] pt-[44px]">
            <ChatOpenButton className="shrink-0 bg-accent border border-white/20 text-black !text-[14px] font-medium padding-x py-2 rounded-full hover:opacity-80 transition-opacity cursor-pointer">
              Entre em contato
            </ChatOpenButton>
          </div>

          {/* Main content — full-width, no sidebar wrapper */}
          <div className="pt-[60px] lg:pt-0">
            <main id="main-content">{children}</main>
            <Footer />
          </div>

          {/* Sticky top nav — black pill, appears on scroll-up after sidebar exits viewport */}
          <StickyTopNav />
          <CookieBanner />
          {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics id={process.env.NEXT_PUBLIC_GA_ID} />}
          {process.env.NEXT_PUBLIC_META_PIXEL_ID && <MetaPixel id={process.env.NEXT_PUBLIC_META_PIXEL_ID} />}
        </ChatProvider>
      </body>
    </html>
  )
}
