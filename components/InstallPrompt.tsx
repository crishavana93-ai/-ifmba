/**
 * InstallPrompt — non-intrusive popup that invites visitors to install
 * ifmba.se as a standalone app ("not as a browser tab").
 *
 * Platform handling:
 *   • Android / Chrome / Edge: captures the native `beforeinstallprompt`
 *     event and triggers the real install flow with `prompt()`.
 *   • iOS Safari: no beforeinstallprompt support, so we show step-by-step
 *     "Dela → Lägg till på hemskärmen" instructions instead.
 *
 * Frequency rules (to avoid nagging):
 *   • Hidden entirely if the app is already running in standalone mode
 *     (i.e. it's already been installed).
 *   • First appearance: after 15 s on page (enough time to judge the site).
 *   • Dismissed → re-shown after 14 days.
 *   • Accepted install → never shown again.
 */
'use client'

import { useEffect, useState } from 'react'

type BIPEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'mba_pwa_dismissed_at'
const NEVER_KEY = 'mba_pwa_installed'
const NAG_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000 // 14 days

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari home-screen-launched flag
    (window.navigator as any).standalone === true
  )
}

function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
}

function recentlyDismissed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (localStorage.getItem(NEVER_KEY) === '1') return true
    const at = localStorage.getItem(DISMISS_KEY)
    if (!at) return false
    return Date.now() - Number(at) < NAG_COOLDOWN_MS
  } catch {
    return false
  }
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [iosMode, setIosMode] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isStandalone() || recentlyDismissed()) return

    const ios = isIOS()
    if (ios) {
      // iOS has no native prompt API — surface instructions after a delay.
      const t = setTimeout(() => {
        setIosMode(true)
        setVisible(true)
      }, 15000)
      return () => clearTimeout(t)
    }

    const onBIP = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BIPEvent)
      // Small delay so we don't interrupt the first glance at the page.
      setTimeout(() => setVisible(true), 15000)
    }
    const onInstalled = () => {
      try {
        localStorage.setItem(NEVER_KEY, '1')
      } catch {}
      setVisible(false)
    }
    window.addEventListener('beforeinstallprompt', onBIP)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!deferred) return
    try {
      await deferred.prompt()
      const { outcome } = await deferred.userChoice
      if (outcome === 'accepted') {
        try {
          localStorage.setItem(NEVER_KEY, '1')
        } catch {}
      } else {
        dismiss()
      }
    } catch {
      dismiss()
    }
    setVisible(false)
    setDeferred(null)
  }

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="pwa-prompt" role="dialog" aria-live="polite" aria-label="Installera MBA som app">
      <button
        type="button"
        className="pwa-prompt-close"
        onClick={dismiss}
        aria-label="Stäng"
      >
        ✕
      </button>

      <div className="pwa-prompt-icon" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/apple-touch-icon.png" alt="" width={56} height={56} />
      </div>

      <div className="pwa-prompt-body">
        <div className="pwa-prompt-title">Installera MBA som app</div>

        {iosMode ? (
          <div className="pwa-prompt-copy">
            Tryck på <span className="pwa-ios-icon" aria-label="Dela">
              {/* Share glyph */}
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden="true">
                <path
                  d="M7 1v9M3.5 4.5L7 1l3.5 3.5M1 8v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>{' '}
            och välj <strong>Lägg till på hemskärmen</strong>.
          </div>
        ) : (
          <div className="pwa-prompt-copy">
            Få MBA direkt på hemskärmen — snabbare, fullskärm, och utan
            webbläsarflikar.
          </div>
        )}
      </div>

      {!iosMode && deferred && (
        <button type="button" className="pwa-prompt-cta" onClick={install}>
          Installera
        </button>
      )}
      {iosMode && (
        <button type="button" className="pwa-prompt-cta ghost" onClick={dismiss}>
          Okej
        </button>
      )}
    </div>
  )
}
