'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Crest from './Crest'
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
          className="nav-logo"
          aria-label={t('nav.logoAria')}
          onClick={onLogoClick}
        >
          <div className="nav-logo-mark">
            <Crest size={40} priority />
          </div>
          <div>
            <div className="nav-logo-text">MBA</div>
            <div className="nav-logo-sub">Malmö Basket Amatörer</div>
          </div>
        </Link>

        <div className={`nav-links${menuOpen ? ' open' : ''}`} id="nav-links">
          <Link href="/nyheter" onClick={() => setMenuOpen(false)}>{t('nav.news')}</Link>
          <a {...hashLinkProps('standings')}>{t('nav.table')}</a>
          <a {...hashLinkProps('squad')}>{t('nav.squad')}</a>
          <a {...hashLinkProps('media')}>{t('nav.gallery')}</a>
          <a {...hashLinkProps('apparel')}>{t('nav.merch')}</a>
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
