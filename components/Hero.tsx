'use client'
import { urlFor } from '@/lib/sanity'
import Crest from './Crest'

export default function Hero({ settings }: { settings: any }) {
  const heroUrl = settings?.heroImage
    ? urlFor(settings.heroImage).width(1920).quality(85).url()
    : '/mba_family_hero.jpeg'

  const season = settings?.season || '2025/26'
  const division = settings?.division || 'Div 3 Skåne'

  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <img
          className="hero-fallback"
          src={heroUrl}
          alt="MBA Basketball — The Family"
        />
      </div>
      <div className="hero-overlay" />
      <div className="hero-vignette" />
      <div className="hero-grain" />

      {/* Crest — anchored top-left, under the nav */}
      <Crest size={120} className="hero-crest" />

      <div className="contain hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          <span>Säsong {season} · {division} · #1</span>
        </div>

        <h1 className="hero-wordmark">MBA</h1>

        <p className="hero-sub">
          {settings?.heroTaglineSv || (
            <>
              <strong>Malmö Basket.</strong> Inte bara ett lag — en familj, en rörelse, en stad.
              8 nationer. 1 tröja.
            </>
          )}
        </p>

        <div className="hero-actions">
          <button
            className="hero-btn hero-btn-primary"
            onClick={() =>
              document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Gå med nu
          </button>
          <button
            className="hero-btn hero-btn-outline"
            onClick={() =>
              document.getElementById('standings')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Se tabellen
          </button>
        </div>
      </div>
    </section>
  )
}
