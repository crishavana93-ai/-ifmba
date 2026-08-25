import type { Metadata, Viewport } from 'next'
import '../styles/mba.css'
import InstallPrompt from '@/components/InstallPrompt'
import CookieConsent from '@/components/CookieConsent'
import PageCurtain from '@/components/PageCurtain'
import { I18nProvider } from '@/lib/i18n'
import { safeFetch, QUERIES } from '@/lib/sanity'

// NOTE: Fonts loaded via <link> at runtime instead of next/font/google,
// because next/font requires network access to fonts.googleapis.com AT BUILD TIME —
// builds on offline / firewalled networks fail otherwise. The CSS font-family stacks
// in mba.css include full system fallbacks, so the site still renders cleanly
// even if Google Fonts is blocked at runtime.

const SITE_URL = 'https://www.ifmba.se'
const SITE_TITLE = 'MBA — Malmö Basket | Basketklubb i Malmö'
const SITE_DESC =
  'Basketklubb i Malmö — MBA är Malmös mest internationella basketfamilj. ' +
  '15 nationer, 1 tröja. Herrlag i Div 2 Skåne 2026/27. Spela basket i Malmö, ' +
  'bli partner eller följ resan.'

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
  // ?v=2 cache-bust: the original favicon.ico that shipped with the Vercel
  // template was a corrupted Targa file, so browsers + Vercel's edge cache
  // held onto Vercel's default triangle. Bump this version every time the
  // icon source changes — it's the only reliable way to force every Chrome
  // / Safari / Firefox install to refetch.
  icons: {
    icon: [
      { url: '/icon.svg?v=4', type: 'image/svg+xml' },
      { url: '/favicon.ico?v=4', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=4', sizes: '180x180' },
    ],
    shortcut: '/favicon.ico?v=4',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Social URLs come from Sanity siteSettings so the schema.org sameAs list
  // stays in sync with the footer icons — no redeploy when Cris adds a channel.
  const settings = await safeFetch<any>(QUERIES.settings, null)
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
        <I18nProvider>
          {children}
          <CookieConsent />
          <InstallPrompt />
          {process.env.NEXT_PUBLIC_CINEMATIC === '1' && <PageCurtain />}
        </I18nProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              // SportsOrganization + local signals (address, area served) —
              // this is the markup Google uses for the local pack / knowledge
              // panel for "basketklubb malmö"-type queries.
              '@type': 'SportsOrganization',
              '@id': `${SITE_URL}/#organization`,
              name: 'MBA — Malmö Basket',
              alternateName: ['MBA Malmö', 'Malmö Basket Amatörer'],
              description:
                'Basketklubb i Malmö — 15 nationer, 1 tröja. Herrlag i Div 2 Skåne 2026/27, casual games och gemenskap.',
              url: SITE_URL,
              logo: `${SITE_URL}/apple-touch-icon.png`,
              image: `${SITE_URL}/opengraph-image`,
              sport: 'Basketball',
              keywords: 'basketklubb Malmö, basket Malmö, spela basket Malmö, basketlag Skåne',
              areaServed: { '@type': 'City', name: 'Malmö' },
              location: {
                '@type': 'SportsActivityLocation',
                name: 'Latinskolans sporthall',
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: 'Lorensborgsgatan 1',
                  postalCode: '217 45',
                  addressLocality: 'Malmö',
                  addressCountry: 'SE',
                },
              },
              email: 'info@ifmba.se',
              memberOf: {
                '@type': 'SportsOrganization',
                name: 'Svenska Basketbollförbundet',
                url: 'https://www.basket.se',
              },
              sameAs: [
                // Profixio — Div 2 Skåne Herr 2026/27 team page (leagueid27739,
                // updated 2026-08-23 when the 26/27 schedule was published).
                'https://www.profixio.com/app/lx/competition/leagueid27739/teams/1589295',
                settings?.instagramUrl,
                settings?.facebookUrl,
                settings?.tiktokUrl,
                settings?.youtubeUrl,
              ].filter(Boolean),
            }),
          }}
        />
      </body>
    </html>
  )
}
