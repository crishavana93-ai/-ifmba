/**
 * /studio — Sanity Studio mounted as a Next.js catch-all route.
 *
 * Visit: https://ifmba.se/studio
 *
 * The club signs in with their Sanity account (Google / GitHub / email magic-link)
 * and edits content directly. Changes go live on the site on the next ISR revalidation
 * (max 60s, see `export const revalidate = 60` on page.tsx).
 *
 * NOTE: This is a client component (Studio runs in the browser). The catch-all
 * segment [[...tool]] lets Sanity route its own subpages (e.g. /studio/vision).
 */
'use client'

import {NextStudio} from 'next-sanity/studio'
// Path is relative to the DEPLOYED repo layout (~/ifmba, flat app/ at root),
// NOT the scaffold's src/app/ layout. From app/studio/[[...tool]]/page.tsx:
//   ..  → app/studio/
//   ..  → app/
//   ..  → repo root (sanity.config.ts lives here)
import config from '../../../sanity.config'

// Force dynamic — the Studio is an authenticated editor UI, never static.
export const dynamic = 'force-static'

export default function StudioPage() {
  return <NextStudio config={config} />
}
