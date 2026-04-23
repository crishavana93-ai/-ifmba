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

export default function Highlights({ media = [] }: { media?: MediaRow[] }) {
  const clips = media
    .filter(
      (m) =>
        m.kind === 'video' &&
        (m.category === 'gameday' || m.category === 'matchday-reel') &&
        m.videoUrl,
    )
    .slice(0, 4)

  if (clips.length === 0) {
    return null // nothing to show — skip the whole section
  }

  return (
    <section className="highlights section section-dark" id="highlights">
      <div className="contain">
        <div className="label r">Höjdpunkter</div>
        <h2 className="title r">
          Top plays <em>från planen</em>
        </h2>

        <div className="hl-reel">
          {clips.map((clip, i) => (
            <HighlightCard key={clip._id} clip={clip} delay={i * 80} />
          ))}
        </div>
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
