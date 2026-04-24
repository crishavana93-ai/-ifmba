/**
 * MBA Crest.
 *
 * Displays the official MBA club logo (yellow crown/sun + basketball + MBA
 * banner) as a next/image loaded from /mba-logo.png. If that file 404s we
 * fall back to an inline SVG so the site always renders something.
 *
 * To update the logo:
 *   1. Save the optimized PNG/SVG to ifmba-scaffold/public/mba-logo.png.
 *      next/image will resize + convert to AVIF/WebP on the fly — the 889KB
 *      source is fine; browsers never see the raw file.
 *   2. Run sync-and-deploy.sh (the Vercel project lives at ~/ifmba/, not
 *      this scaffold — the script copies /public/mba-logo.png into it).
 *   3. If visitors still see the old logo, rename the file (mba-logo-v2.png)
 *      and update the `src` default below — this is the nuclear cache-bust.
 * Nothing else needed — every Crest usage across the site picks it up.
 */
'use client'
import Image from 'next/image'
import { useState } from 'react'

// When the logo file itself changes, next/image's content-based URL hashing
// already busts caches automatically — no query string needed. If you ever
// need an additional nuclear cache-bust, rename the file (mba-logo-v2.png)
// and update the `src` default below.

export default function Crest({
  size = 120,
  className = '',
  src = '/mba-logo.png',
  priority = false,
}: {
  size?: number
  className?: string
  src?: string
  /** Pass `priority` for the hero / nav crest so it's preloaded. */
  priority?: boolean
}) {
  const [broken, setBroken] = useState(false)

  if (!broken) {
    return (
      <Image
        src={src}
        width={size}
        height={size}
        alt="MBA — Malmö Basket Amatörer"
        className={className}
        priority={priority}
        style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
        onError={() => setBroken(true)}
        // next/image delivers AVIF/WebP automatically at the request size —
        // the 889KB source PNG is optimized down to a few KB at 40px.
      />
    )
  }

  // Fallback SVG — only shown if /mba-logo.png 404s
  const rays = Array.from({ length: 16 }, (_, i) => i * (360 / 16))
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      aria-label="MBA crest"
      role="img"
    >
      <circle cx="100" cy="100" r="96" fill="#FFCB05" />
      <circle cx="100" cy="100" r="86" fill="#0B1220" />
      <circle cx="100" cy="100" r="78" fill="#4AB5DE" />
      <g transform="translate(100,100)">
        {rays.map((deg) => (
          <rect
            key={deg}
            x="-3"
            y="-78"
            width="6"
            height="16"
            fill="#FFCB05"
            transform={`rotate(${deg})`}
            rx="1.5"
          />
        ))}
      </g>
      <g transform="translate(100,78)">
        <circle cx="0" cy="0" r="26" fill="#FFCB05" stroke="#0B1220" strokeWidth="2.5" />
        <line x1="-26" y1="0" x2="26" y2="0" stroke="#0B1220" strokeWidth="2" />
        <path d="M 0,-26 Q 12,0 0,26" fill="none" stroke="#0B1220" strokeWidth="2" />
        <path d="M 0,-26 Q -12,0 0,26" fill="none" stroke="#0B1220" strokeWidth="2" />
      </g>
      <g>
        <rect x="32" y="118" width="136" height="36" fill="#0B1220" stroke="#FFCB05" strokeWidth="2.5" />
        <text
          x="100"
          y="143"
          textAnchor="middle"
          fill="#FFCB05"
          fontFamily="Inter Tight, system-ui, sans-serif"
          fontSize="22"
          fontWeight="900"
          letterSpacing="4"
        >
          MBA
        </text>
      </g>
    </svg>
  )
}
