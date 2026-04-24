import type { Metadata, Viewport } from 'next'
import '../styles/mba.css'

// NOTE: Fonts loaded via <link> at runtime instead of next/font/google,
// because next/font requires network access to fonts.googleapis.com AT BUILD TIME —
// builds on offline / firewalled networks fail otherwise. The CSS font-family stacks
// in mba.css include full system fallbacks, so the site still renders cleanly
// even if Google Fonts is blocked at runtime.

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
    <html lang="sv">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;800&display=swap"
        />
      </head>
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
