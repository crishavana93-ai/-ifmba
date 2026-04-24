'use client'
/**
 * Drop — Next tip-off split section (video left, game info + countdown right).
 * Mirrors the local prototype's <section class="drop">.
 *
 * Video source: pulled from Sanity media with category "matchday-reel"
 * or placement "tipoff-reel". Falls back to /assets/video/match-day-promo.mp4.
 */
import { useEffect, useRef, useState } from 'react'

function pad(n: number) { return n < 10 ? '0' + n : String(n) }
function fmtSweDate(d: Date) {
  const days = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör']
  const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} · ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function Drop({ settings, media }: { settings: any; media: any[] }) {
  const nextMatchDate: string | undefined = settings?.nextMatchDate
  const opponent: string = settings?.nextMatchOpponent || 'IK Eos Lund HJ'
  const venue: string = settings?.nextMatchVenue || 'Latinskolans sporthall'

  // Find match-day video from Sanity. If none uploaded, we skip the <video>
  // element entirely and just show the family-hero poster as a static background
  // so the section doesn't look blank.
  const video = media?.find(
    (m: any) =>
      m.kind === 'video' &&
      (m.placement === 'tipoff-reel' || m.category === 'matchday-reel'),
  )
  const hasVideo = !!video?.videoUrl
  const videoSrc: string | null = video?.videoUrl || null
  const posterSrc: string = video?.posterUrl || '/mba_family_hero.jpeg'

  const [cd, setCd] = useState({ d: '00', h: '00', m: '00', s: '00', live: false })
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    if (!nextMatchDate) return
    const target = new Date(nextMatchDate).getTime()
    const tick = () => {
      const diff = target - Date.now()
      if (diff <= 0) {
        setCd({ d: '00', h: '00', m: '00', s: '00', live: diff > -2.5 * 3600 * 1000 })
        return
      }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCd({ d: pad(d), h: pad(h), m: pad(m), s: pad(s), live: false })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [nextMatchDate])

  const whenStr = nextMatchDate ? fmtSweDate(new Date(nextMatchDate)) : '—'

  const toggleSound = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
    if (!v.muted) v.play().catch(() => {})
  }

  return (
    <section className="drop" id="drop">
      <div className="drop-video-overlay" />
      <div className="contain drop-inner">
        <div className="drop-split">
          <div className="drop-video-card">
            <div className="drop-video-frame">
              {hasVideo ? (
                <video
                  ref={videoRef}
                  className="drop-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={posterSrc}
                >
                  <source src={videoSrc!} type="video/mp4" />
                </video>
              ) : (
                <img className="drop-video" src={posterSrc} alt="MBA Family" />
              )}
              <span className="drop-video-tag">
                <span className="dv-dot" />
                {hasVideo ? 'MATCH-DAY REEL' : 'MATCH-DAY REEL · laddar upp snart'}
              </span>
              {hasVideo && (
                <button
                  className={`drop-video-sound${muted ? ' muted' : ''}`}
                  type="button"
                  aria-label="Ljud av/på"
                  onClick={toggleSound}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 10v4h4l5 4V6l-5 4H3z" fill="currentColor" />
                    <path className="dvs-wave" d="M16 9a5 5 0 010 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
            <div className="drop-video-foot">
              <span>{hasVideo ? 'Loop · muted · 1080p' : 'Poster · familjen'}</span>
              <span className="drop-video-foot-sep">·</span>
              <span>Byt via <b>/studio</b></span>
            </div>
          </div>
          <div className="drop-info-card">
            <div className="drop-header">
              <span className="drop-live-dot" />
              <span className="drop-label">{cd.live ? 'Live nu' : 'Nästa tip-off'}</span>
            </div>
            <h2 className="drop-matchup">
              MBA <em>vs</em> {opponent}
            </h2>
            <div className="drop-meta">
              <span>{venue}</span>
              <span className="drop-sep">·</span>
              <span>{whenStr}</span>
            </div>
            {!cd.live && nextMatchDate && (
              <div className="drop-grid">
                <div className="drop-unit"><div className="drop-num">{cd.d}</div><div className="drop-lbl">Dagar</div></div>
                <div className="drop-unit"><div className="drop-num">{cd.h}</div><div className="drop-lbl">Timmar</div></div>
                <div className="drop-unit"><div className="drop-num">{cd.m}</div><div className="drop-lbl">Minuter</div></div>
                <div className="drop-unit"><div className="drop-num">{cd.s}</div><div className="drop-lbl">Sekunder</div></div>
              </div>
            )}
            {cd.live && (
              <div className="drop-live show">
                <span className="drop-live-badge">Live nu · Tip-off</span>
              </div>
            )}
            <div className="drop-cta-row">
              <button
                className="drop-cta drop-cta-primary"
                onClick={() => document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Kom på match
              </button>
              <a
                className="drop-cta drop-cta-ghost"
                href="https://www.profixio.com/app/leagueid16182/category/1150620"
                target="_blank"
                rel="noopener"
              >
                Se schema →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
