'use client'
import { useEffect, useState } from 'react'
import Crest from './Crest'

export default function Navbar() {
  const [shrink, setShrink] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setShrink(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav className={`nav${shrink ? ' shrink' : ''}`} id="nav">
      <div className="contain nav-inner">
        <a
          href="#hero"
          className="nav-logo"
          aria-label="MBA — till toppen"
          onClick={(e) => {
            e.preventDefault()
            scrollTo('hero')
          }}
        >
          <div className="nav-logo-mark">
            <Crest size={30} />
          </div>
          <div>
            <div className="nav-logo-text">MBA</div>
            <div className="nav-logo-sub">Malmö Basket</div>
          </div>
        </a>

        <div className={`nav-links${menuOpen ? ' open' : ''}`} id="nav-links">
          <a href="#news" onClick={(e) => { e.preventDefault(); scrollTo('news') }}>Nyheter</a>
          <a href="#standings" onClick={(e) => { e.preventDefault(); scrollTo('standings') }}>Tabell</a>
          <a href="#squad" onClick={(e) => { e.preventDefault(); scrollTo('squad') }}>Trupp</a>
          <a href="#courts" onClick={(e) => { e.preventDefault(); scrollTo('courts') }}>Courts</a>
          <a href="#sponsors" onClick={(e) => { e.preventDefault(); scrollTo('sponsors') }}>Partners</a>
        </div>

        <div className="nav-actions">
          <button className="btn-cta" onClick={() => scrollTo('join')}>
            Join
          </button>
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
