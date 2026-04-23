import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import DesktopSidebar from '@/components/layout/DesktopSidebar'
import MobileNav from '@/components/layout/MobileNav'
import StickyTopNav from '@/components/layout/StickyTopNav'
import Footer from '@/components/layout/Footer'
import { organizationSchema, webSiteSchema } from '@/lib/schema'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-poppins',
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
    <html lang="pt-BR" className={`${poppins.variable} scroll-smooth`}>
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
        {/* Mobile fixed top bar */}
        <MobileNav />

        {/* Desktop: flex layout — sidebar scrolls with page */}
        <div className="lg:flex">
          {/* Sidebar — not fixed, part of the flow */}
          <DesktopSidebar />

          {/* Content column */}
          <div className="flex-1 min-w-0 pt-[60px] lg:pt-0">
            {/* Desktop contact button — in flow, top-right, scrolls with page */}
            <div className="hidden lg:flex justify-end px-6 pt-[18px]">
              <a
                href="mailto:contato@floux.com.br"
                className="inline-block bg-accent border border-black/20 text-black text-[14px] font-medium px-5 py-2 rounded-full hover:opacity-80 transition-opacity"
              >
                Entre em contato
              </a>
            </div>

            <main id="main-content">{children}</main>
            <Footer />
          </div>
        </div>

        {/* Sticky top nav — fixed, black, appears only when sidebar is off-screen + scroll up */}
        <StickyTopNav />
      </body>
    </html>
  )
}
