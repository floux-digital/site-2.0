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
import GlobalUIWrapper from '@/components/layout/GlobalUIWrapper'

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
  metadataBase: new URL('https://flouxdigital.com.br'),
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
  authors: [{ name: 'Floux', url: 'https://flouxdigital.com.br' }],
  creator: 'Floux',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://flouxdigital.com.br',
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
    canonical: 'https://flouxdigital.com.br',
    languages: { 'pt-BR': 'https://flouxdigital.com.br' },
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
          <GlobalUIWrapper>
            {children}
          </GlobalUIWrapper>
          <CookieBanner />
          {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics id={process.env.NEXT_PUBLIC_GA_ID} />}
          {process.env.NEXT_PUBLIC_META_PIXEL_ID && <MetaPixel id={process.env.NEXT_PUBLIC_META_PIXEL_ID} />}
        </ChatProvider>
      </body>
    </html>
  )
}
