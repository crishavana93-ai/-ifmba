import type { Metadata, Viewport } from 'next'
import { Inter_Tight, JetBrains_Mono } from 'next/font/google'
import '../styles/mba.css'

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400','500','600','700','800','900'],
  variable: '--font-inter-tight',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400','600','800'],
  variable: '--font-mono',
  display: 'swap',
})

const SITE_URL = 'https://www.ifmba.se'
const SITE_TITLE = 'MBA — Malmö Basket'
const SITE_DESC =
  'Malmös internationella basketfamilj. 9 nationer. 1 tröja. Div 3 Skåne.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESC,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESC,
    siteName: 'MBA — Malmö Basket',
    locale: 'sv_SE',
    // images auto-populated from src/app/opengraph-image.tsx
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESC,
    // image auto-populated from opengraph-image.tsx unless twitter-image.tsx present
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${interTight.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SportsOrganization',
              name: 'MBA — Malmö Basket',
              url: SITE_URL,
              logo: `${SITE_URL}/apple-touch-icon.png`,
              image: `${SITE_URL}/opengraph-image`,
              sport: 'Basketball',
              location: {
                '@type': 'Place',
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Malmö',
                  addressCountry: 'SE',
                },
              },
              email: 'mba.malmo.basket@gmail.com',
              sameAs: ['https://www.profixio.com/app/leagueid16182/category/1150620'],
            }),
          }}
        />
      </body>
    </html>
  )
}
