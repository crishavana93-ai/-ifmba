/**
 * CookieConsent — GDPR-lite banner.
 *
 * We use Plausible (cookieless) for analytics and localStorage for the
 * voting state, so this is a notice + "Got it" rather than a full
 * granular consent manager. If we ever add Meta Pixel or similar tracking
 * cookies, upgrade to a proper Cookiebot-style control.
 *
 * Stores an acceptance timestamp in localStorage so the banner never
 * nags again on the same device.
 */
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const KEY = 'mba_cookie_consent_v1'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (!localStorage.getItem(KEY)) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    try {
      localStorage.setItem(KEY, String(Date.now()))
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <div className="cookie-banner-body">
        <strong>Vi respekterar din integritet</strong>
        <p>
          Vi använder bara teknisk lagring som krävs för att webbplatsen
          ska fungera, samt anonym statistik utan cookies.{' '}
          <Link href="/integritetspolicy">Läs mer</Link>.
        </p>
      </div>
      <button type="button" className="cookie-banner-ok" onClick={accept}>
        Okej
      </button>
    </div>
  )
}
