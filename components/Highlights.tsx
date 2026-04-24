/**
 * Highlights — short-form video reel of top plays.
 *
 * Data: `mediaAsset` with kind === 'video' AND category === 'gameday' (or 'matchday-reel').
 * We show the first 4 so it never pushes the page unbearably long.
 *
 * UX: cards autoplay muted on hover (desktop) and on enter (mobile). Click
 * unmutes+seeks to 0. Falls back to poster image if no video is wired up.
 */
'use client'

import { useEffect, useRef, useState } from 'react'

type MediaRow = {
  _id: string
  kind: 'photo' | 'video'
  category?: string
  title?: string
  captionSv?: string
  captionEn?: string
  videoUrl?: string | null
  posterUrl?: string | null
}

export default function Highlights({ media = [], num, numText, className }: { media?: MediaRow[]; num?: string; numText?: string; className?: string }) {
  const clips = media
    .filter(
      (m) =>
        m.kind === 'video' &&
        (m.category === 'gameday' || m.category === 'matchday-reel') &&
        m.videoUrl,
    )
    .slice(0, 4)

  return (
    <section className={`highlights section ${className || ''}`.trim()} data-num={num} data-num-text={numText} id="highlights">
      <div className="contain">
        <div className="label r">Höjdpunkter</div>
        <h2 className="title r">
          Top plays <em>från planen</em>
        </h2>

        {clips.length > 0 ? (
          <div className="hl-reel">
            {clips.map((clip, i) => (
              <HighlightCard key={clip._id} clip={clip} delay={i * 80} />
            ))}
          </div>
        ) : (
          <div className="hl-empty r">
            <div className="hl-empty-grid">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="hl-empty-card">
                  <div className="hl-empty-play">▶</div>
                  <div className="hl-empty-tag">Clip #{n}</div>
                </div>
              ))}
            </div>
            <div className="hl-empty-copy">
              <strong>Höjdpunkter laddas upp snart.</strong>
              <span>Klubben publicerar nya klipp via <b>/studio</b> efter varje match.</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function HighlightCard({ clip, delay }: { clip: MediaRow; delay: number }) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const [unmuted, setUnmuted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Auto-play when ≥50% visible (mobile-friendly)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) el.play().catch(() => {})
          else el.pause()
        }
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const toggleSound = () => {
    const el = ref.current
    if (!el) return
    el.muted = !el.muted
    setUnmuted(!el.muted)
  }

  const caption = clip.captionSv || clip.captionEn || clip.title || 'Highlight'

  return (
    <div
      className="hl-card r"
      style={{ transitionDelay: `${delay}ms` }}
      onClick={toggleSound}
      onMouseEnter={() => ref.current?.play().catch(() => {})}
    >
      <video
        ref={ref}
        src={clip.videoUrl!}
        poster={clip.posterUrl || undefined}
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="hl-play" />
      <div className="hl-meta">
        <div className="hl-sub">{unmuted ? '🔊 Sound on' : '🔇 Tap for sound'}</div>
        <div className="hl-title">{caption}</div>
      </div>
    </div>
  )
}
