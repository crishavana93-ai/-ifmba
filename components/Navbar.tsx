'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
// Crest dropped from the navbar 2026-05-12 — Cris wanted a clean wordmark only.
import LangToggle from './LangToggle'
import { useT } from '@/lib/i18n'

/**
 * Navbar.
 *
 * Logo behavior:
 *   - From any page: clicking the MBA logo navigates to `/` (home).
 *   - When already on `/`: clicking it scrolls to the top (no reload, just
 *     a smooth scroll).
 *
 * In-page nav links (#standings, #squad, …) use smooth-scroll when on `/`
 * and fall back to `/#section` links when on another page so users can jump
 * from /partners or /nyheter back to a specific homepage section.
 */
export default function Navbar() {
  const [shrink, setShrink] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const onHome = pathname === '/'
  const t = useT()

  useEffect(() => {
    const onScroll = () => setShrink(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  // Wraps an anchor to make it a smooth-scroll on home, or a real link
  // (handled by Next Link) from sub-pages.
  const hashLinkProps = (id: string) => {
    if (onHome) {
      return {
        href: `#${id}`,
        onClick: (e: React.MouseEvent) => {
          e.preventDefault()
          scrollToId(id)
        },
      }
    }
    return { href: `/#${id}`, onClick: () => setMenuOpen(false) }
  }

  // Logo click: from sub-pages Next Link handles the nav; on home, scroll to top.
  const onLogoClick = (e: React.MouseEvent) => {
    if (onHome) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setMenuOpen(false)
  }

  return (
    <nav className={`nav${shrink ? ' shrink' : ''}`} id="nav">
      <div className="contain nav-inner">
        <Link
          href="/"
          className="nav-logo nav-logo--clean"
          aria-label={t('nav.logoAria')}
          onClick={onLogoClick}
        >
          {/* Wordmark only — the circular crest + "Malmö Basket Amatörer"
              subtitle were retired so the header reads as a single confident
              brand token, like NYK, PSG, or LAFC. */}
          <span className="nav-logo-text">MBA</span>
        </Link>

        <div className={`nav-links${menuOpen ? ' open' : ''}`} id="nav-links">
          <Link href="/nyheter" onClick={() => setMenuOpen(false)}>{t('nav.news')}</Link>
          <a {...hashLinkProps('standings')}>{t('nav.table')}</a>
          <a {...hashLinkProps('squad')}>{t('nav.squad')}</a>
          <a {...hashLinkProps('media')}>{t('nav.gallery')}</a>
          {/* SHOP — dedicated /butik storefront. Highlighted with a yellow
              "NEW" dot to draw the eye until the launch is no longer fresh
              (~3 months from May 2026, then strip the dot). */}
          <Link
            href="/butik"
            className="nav-shop-link"
            onClick={() => setMenuOpen(false)}
          >
            {t('nav.merch')}
            <span className="nav-shop-dot" aria-hidden="true" />
          </Link>
          <Link href="/partners" onClick={() => setMenuOpen(false)}>{t('nav.partners')}</Link>
        </div>

        <div className="nav-actions">
          <LangToggle />
          {/* "Join" routes to /anslut (three membership tracks). */}
          <Link
            className="btn-cta"
            href="/anslut"
            onClick={() => setMenuOpen(false)}
          >
            {t('nav.join')}
          </Link>
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            &#9776;
          </button>
        </div>
      </div>
    </nav>
  )
}
