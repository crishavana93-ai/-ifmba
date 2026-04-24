/**
 * Web App Manifest — makes ifmba.se installable as a Progressive Web App
 * on Android/Chrome/Edge ("Install app") and iOS Safari ("Add to Home Screen").
 *
 * Next.js auto-serves this as /manifest.webmanifest and injects the
 * <link rel="manifest"> tag into the page head. No extra wiring needed in
 * layout.tsx beyond what Next does automatically.
 *
 * Icons reference the existing /apple-touch-icon.png plus the
 * Next-generated icon at /icon (from src/app/icon.png).
 */
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MBA — Malmö Basket',
    short_name: 'MBA',
    description:
      'Malmös internationella basketfamilj. 9 nationer. 1 tröja. Div 3 Skåne → Div 2 2026/27.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#0B1220',
    theme_color: '#FFCB05',
    lang: 'sv-SE',
    categories: ['sports', 'lifestyle', 'social'],
    icons: [
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        // Next.js auto-serves the src/app/icon.png at /icon.
        // Split into two entries because Next's Manifest type rejects
        // space-separated purposes (valid per W3C spec but not in Next).
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
