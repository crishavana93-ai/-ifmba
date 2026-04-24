'use client'
import { useEffect, useState } from 'react'
import { urlFor } from '@/lib/sanity'

function pad(n: number) { return n < 10 ? '0' + n : String(n) }
function fmtSweDate(d: Date) {
  const days = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör']
  const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} · ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function Hero({ settings }: { settings: any }) {
  const heroUrl = settings?.heroImage
    ? urlFor(settings.heroImage).width(1920).quality(85).url()
    : '/mba_family_hero.jpeg'

  const season = settings?.season || '2025/26'
  const division = settings?.division || 'Div 2 Skåne · Uppflyttade'
  const nextMatchDate: string | undefined = settings?.nextMatchDate
  const nextOpp: string | undefined = settings?.nextMatchOpponent || 'IK Eos Lund HJ'

  const [cd, setCd] = useState({ d: '00', h: '00', m: '00', s: '00', live: false, past: false })

  useEffect(() => {
    if (!nextMatchDate) return
    const target = new Date(nextMatchDate).getTime()
    const tick = () => {
      const diff = target - Date.now()
      if (diff <= 0) {
        setCd({ d: '00', h: '00', m: '00', s: '00', live: diff > -2.5 * 3600 * 1000, past: diff <= -2.5 * 3600 * 1000 })
        return
      }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCd({ d: pad(d), h: pad(h), m: pad(m), s: pad(s), live: false, past: false })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [nextMatchDate])

  const whenStr = nextMatchDate ? fmtSweDate(new Date(nextMatchDate)) : ''

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
      <div className="hero-text-scrim" />
      <div className="hero-grain" />

      <div className="contain hero-content">
        {nextMatchDate && !cd.past && (
          <div className="hero-countdown" id="hero-countdown">
            <span className="hc-dot" />
            <span className="hc-label">{cd.live ? 'Live nu' : 'Nästa tip-off'}</span>
            <span className="hc-sep">·</span>
            <span className="hc-match">MBA <em>vs</em> {nextOpp}</span>
            <span className="hc-sep hc-desk">·</span>
            <span className="hc-when hc-desk">{whenStr}</span>
            <span className="hc-sep">·</span>
            <span className="hc-time">
              <span>{cd.d}</span>d <span>{cd.h}</span>h <span>{cd.m}</span>m <span>{cd.s}</span>s
            </span>
          </div>
        )}

        <div className="hero-badge">
          <span className="hero-badge-dot" />
          <span>Säsong {season} · {division} · #1</span>
        </div>

        <h1 className="hero-h1">
          <span className="outline">THE</span><br />
          <span className="accent">MBA</span><br />
          FAMILY
        </h1>

        <p className="hero-sub">
          {settings?.heroTaglineSv ||
            'Inte bara ett lag — en familj, en rörelse, en stad. 8 nationer. 1 tröja. Malmös streetball headquarters.'}
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

      <div
        className="hero-scroll"
        onClick={() =>
          document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' })
        }
      >
        SCROLL
        <div className="hero-scroll-line" />
      </div>
    </section>
  )
}
