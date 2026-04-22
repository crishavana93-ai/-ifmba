import { urlFor } from '@/lib/sanity'

export default function Hero({ settings }: { settings: any }) {
  const heroUrl = settings?.heroImage ? urlFor(settings.heroImage).width(1920).quality(85).url() : '/mba_family_hero.jpeg'

  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <img
          className="hero-fallback"
          src={heroUrl}
          alt="MBA Basketball — The Family"
          style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 35%' }}
        />
      </div>
      <div className="hero-overlay" />
      <div className="hero-vignette" />
      <div className="hero-grain" />
      <div className="hero-text-scrim" />
      <div className="contain hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          <span>Säsong {settings?.season || '2025/26'} · {settings?.division || 'Div 3 Skåne'} · #1</span>
        </div>
        <h1 className="hero-h1">
          <span className="outline">MALMÖ</span><br />
          <span className="accent">BASKET</span><br />
          AMATÖRER
        </h1>
        <p className="hero-sub">{settings?.heroTaglineSv || 'Inte bara ett lag — en familj, en rörelse, en stad.'}</p>
        <div className="hero-actions">
          <button className="hero-btn hero-btn-primary" onClick={() => document.getElementById('join')?.scrollIntoView({behavior:'smooth'})}>Gå med nu</button>
          <button className="hero-btn hero-btn-outline" onClick={() => document.getElementById('standings')?.scrollIntoView({behavior:'smooth'})}>Se tabellen</button>
        </div>
      </div>
    </section>
  )
}
