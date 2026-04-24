/**
 * Highlights — swipeable horizontal carousel of top plays.
 *
 * Data: `mediaAsset` with kind === 'video' AND category === 'gameday'
 * (or 'matchday-reel'). We show up to 8 so you can build a real reel
 * without rewriting the component.
 *
 * Interaction:
 *   - Mobile: native touch scroll with CSS scroll-snap → tap card → video
 *     modal plays the clip full-screen with sound.
 *   - Desktop: same scroll-snap track, plus Prev/Next arrows and
 *     mousewheel/drag-to-scroll. Cards all share one size so the rail
 *     looks symmetrical regardless of clip count.
 *   - Placeholder tiles fill the tail so the rail never looks empty.
 */
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import VideoModal from './VideoModal'

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

export default function Highlights({
  media = [],
  num,
  numText,
  className,
}: {
  media?: MediaRow[]
  num?: string
  numText?: string
  className?: string
}) {
  const clips = media
    .filter(
      (m) =>
        m.kind === 'video' &&
        (m.category === 'gameday' || m.category === 'matchday-reel') &&
        m.videoUrl,
    )
    .slice(0, 8)

  // Fill to at least 3 tiles so the carousel never feels sparse.
  const placeholderCount = Math.max(0, 3 - clips.length)

  const [playing, setPlaying] = useState<MediaRow | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  // Update arrow-enabled state based on scroll position.
  const updateArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft < max - 4)
  }, [])

  useEffect(() => {
    updateArrows()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [updateArrows])

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    // Scroll by roughly one card width (first child) + the gap.
    const card = el.querySelector<HTMLElement>('.hl-slide')
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: step * dir, behavior: 'smooth' })
  }

  return (
    <section
      className={`highlights section ${className || ''}`.trim()}
      data-num={num}
      data-num-text={numText}
      id="highlights"
    >
      <div className="contain">
        <div className="hl-head">
          <div>
            <div className="label r">Höjdpunkter</div>
            <h2 className="title r">
              Top plays <em>från planen</em>
            </h2>
          </div>
          <div className="hl-nav r" role="group" aria-label="Carousel controls">
            <button
              type="button"
              className="hl-nav-btn"
              onClick={() => scrollBy(-1)}
              disabled={!canPrev}
              aria-label="Föregående klipp"
            >
              ←
            </button>
            <button
              type="button"
              className="hl-nav-btn"
              onClick={() => scrollBy(1)}
              disabled={!canNext}
              aria-label="Nästa klipp"
            >
              →
            </button>
          </div>
        </div>

        <div
          className="hl-carousel r"
          ref={trackRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="MBA top plays"
        >
          {clips.map((clip) => (
            <HighlightSlide
              key={clip._id}
              clip={clip}
              onOpen={() => setPlaying(clip)}
            />
          ))}
          {Array.from({ length: placeholderCount }).map((_, i) => (
            <div key={`empty-${i}`} className="hl-slide hl-slide-empty" aria-hidden="true">
              <div className="hl-empty-play">▶</div>
              <div className="hl-empty-tag">
                {clips.length === 0 ? `Clip #${i + 1}` : 'Snart'}
              </div>
            </div>
          ))}
        </div>

        {clips.length < 3 && (
          <div className="hl-empty-copy r">
            <strong>
              {clips.length === 0
                ? 'Höjdpunkter laddas upp snart.'
                : `${clips.length} klipp uppladdat — fler på väg.`}
            </strong>
            <span>
              Klubben publicerar nya klipp via <b>/studio</b> efter varje match.
            </span>
          </div>
        )}
      </div>

      {playing && (
        <VideoModal
          src={playing.videoUrl!}
          poster={playing.posterUrl || undefined}
          title={playing.captionSv || playing.captionEn || playing.title}
          onClose={() => setPlaying(null)}
        />
      )}
    </section>
  )
}

function HighlightSlide({ clip, onOpen }: { clip: MediaRow; onOpen: () => void }) {
  const ref = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Preview-play when ≥40% visible in the carousel viewport.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) el.play().catch(() => {})
          else el.pause()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const caption = clip.captionSv || clip.captionEn || clip.title || 'Highlight'

  return (
    <button
      type="button"
      className="hl-slide"
      onClick={onOpen}
      onMouseEnter={() => ref.current?.play().catch(() => {})}
      aria-label={`Spela upp: ${caption}`}
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
      <div className="hl-slide-overlay" aria-hidden="true">
        <span className="hl-slide-play">▶</span>
      </div>
      <div className="hl-slide-caption">{caption}</div>
    </button>
  )
}
