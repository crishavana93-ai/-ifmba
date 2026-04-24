import type { Metadata, Viewport } from 'next'
import '../styles/mba.css'
import InstallPrompt from '@/components/InstallPrompt'
import CookieConsent from '@/components/CookieConsent'

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
  // Icons: explicit declarations so browsers + social platforms find them
  // reliably, alongside Next.js's auto-generation from src/app/icon.png
  // and src/app/apple-icon.png. The classic /favicon.ico is the ultimate
  // fallback that every browser looks for first.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    shortcut: '/favicon.ico',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Plausible Analytics — cookieless, GDPR-friendly, €9/mo. Set
  // NEXT_PUBLIC_PLAUSIBLE_DOMAIN on Vercel (e.g. "ifmba.se") to enable.
  // Until that env var is set, no script loads and no tracking happens.
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  const plausibleSrc =
    process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || 'https://plausible.io/js/script.js'

  return (
    <html lang="sv">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;800&display=swap"
        />
        {plausibleDomain && (
          <script
            defer
            data-domain={plausibleDomain}
            src={plausibleSrc}
          />
        )}
      </head>
      <body>
        {/* Skip-to-content link for keyboard + screen-reader users.
            WCAG 2.2 AA requirement — hidden until focused. */}
        <a href="#main" className="skip-link">Hoppa till innehåll</a>
        {children}
        <CookieConsent />
        <InstallPrompt />
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
              // Profixio — Div 3 Skåne Herr 2025/26 (MBA's current league).
              sameAs: ['https://www.profixio.com/app/lx/competition/leagueid17491/teams/1413022?k=1161117'],
            }),
          }}
        />
      </body>
    </html>
  )
}
