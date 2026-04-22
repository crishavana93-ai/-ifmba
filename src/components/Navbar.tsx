'use client'
import { useEffect, useState } from 'react'

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
        <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); scrollTo('hero') }}>
          <div className="nav-logo-mark">MBA</div>
          <div>
            <div className="nav-logo-text">MBA</div>
            <div className="nav-logo-sub">Malmö Basketball</div>
          </div>
        </a>
        <div className={`nav-links${menuOpen ? ' open' : ''}`} id="nav-links">
          <a href="#standings" onClick={(e) => { e.preventDefault(); scrollTo('standings') }}>Tabell</a>
          <a href="#squad" onClick={(e) => { e.preventDefault(); scrollTo('squad') }}>Trupp</a>
          <a href="#courts" onClick={(e) => { e.preventDefault(); scrollTo('courts') }}>Courts</a>
          <a href="#sponsors" onClick={(e) => { e.preventDefault(); scrollTo('sponsors') }}>Partners</a>
        </div>
        <div className="nav-actions">
          <button className="btn-cta" onClick={() => scrollTo('join')}>Join</button>
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>&#9776;</button>
        </div>
      </div>
    </nav>
  )
}
