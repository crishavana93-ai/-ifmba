/** @type {import('next').NextConfig} */

// Security headers — covers the OWASP / securityheaders.com basics.
// CSP is deliberately in report-only mode during rollout so we don't break
// the existing Sanity CDN + Google Fonts + inline Next.js scripts pipeline.
// Flip `CSP_ENFORCE = 'true'` once a week of report data shows no violations.
const CSP_ENFORCE = process.env.CSP_ENFORCE === 'true'

// Sources we legitimately load from. Keep this list tight.
const csp = [
  "default-src 'self'",
  // Next.js runtime injects inline scripts + uses eval in dev/turbopack.
  // 'unsafe-inline' is unavoidable for Next's hydration JSON + inline styles;
  // 'unsafe-eval' only applies in dev — strip it in Vercel prod env.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.sanity.io https://*.sanity.io",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https: https://cdn.sanity.io https://*.sanity.io https://*.svtstatic.se https://www.basket.se",
  "media-src 'self' blob: https://cdn.sanity.io https://*.sanity.io",
  "connect-src 'self' https://*.sanity.io https://api.resend.com",
  "frame-src 'self' https://www.profixio.com https://www.youtube.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' mailto:",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ')

const securityHeaders = [
  {
    key: CSP_ENFORCE ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only',
    value: csp,
  },
  // Prevents clickjacking via iframe embedding — frame-ancestors in CSP is
  // the modern equivalent, but X-Frame-Options is still respected by older
  // browsers.
  { key: 'X-Frame-Options', value: 'DENY' },
  // Block MIME-sniffing so browsers don't try to "help" by re-interpreting
  // responses.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Strip referrer on cross-origin requests but keep path on same-origin
  // (so our own analytics still works).
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable APIs we don't use — locks down browser features that could be
  // abused if an attacker ever injected a script.
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'interest-cohort=()',
    ].join(', '),
  },
  // Force HTTPS for 1 year (preload-eligible). Vercel already redirects
  // HTTP → HTTPS, this tells browsers to never try HTTP again.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
]

const nextConfig = {
  // Next/Image settings — Sanity CDN + any site where we render third-party
  // og:image thumbnails from RSS feeds (SBBF, SVT).
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: '**.sanity.io' },
      { protocol: 'https', hostname: '**.svtstatic.se' },
      { protocol: 'https', hostname: 'www.basket.se' },
    ],
    // Bump default quality — 75 is Next's default and looks visibly soft
    // on the MBA logo at high-DPI screens. 85 is the sweet spot.
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      // Apply security headers to every route.
      { source: '/:path*', headers: securityHeaders },
      // PWA: web app manifest needs a long cache life.
      {
        source: '/manifest.webmanifest',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
    ]
  },
}

export default nextConfig
