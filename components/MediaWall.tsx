/**
 * MediaWall — Team / Fans / Game Day tabbed photo+video gallery.
 *
 * Data: `mediaAsset` documents filtered client-side by category. The full list
 * arrives from page.tsx via QUERIES.mediaAll so we only do one network round-trip.
 *
 * Tabs:
 *   - team    → category === 'team'
 *   - fans    → category === 'fans'
 *   - gameday → category === 'gameday'
 *
 * Video tiles render <video> with autoplay/muted/loop so they double as moving
 * thumbnails. Poster falls back to a generic basketball gradient if not set.
 */
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { thumb } from '@/lib/sanity'

type MediaRow = {
  _id: string
  kind: 'photo' | 'video'
  category?: string
  title?: string
  captionSv?: string
  captionEn?: string
  imageUrl?: string | null
  videoUrl?: string | null
  posterUrl?: string | null
}

type TabKey = 'team' | 'fans' | 'gameday'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'team', label: 'Team' },
  { key: 'fans', label: 'Fans' },
  { key: 'gameday', label: 'Game Day' },
]

export default function MediaWall({ media = [], num, numText, className }: { media?: MediaRow[]; num?: string; numText?: string; className?: string }) {
  const [tab, setTab] = useState<TabKey>('team')
  const gridRef = useRef<HTMLDivElement>(null)

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { team: 0, fans: 0, gameday: 0 }
    for (const m of media) {
      if (m.category && m.category in c) c[m.category as TabKey]++
    }
    return c
  }, [media])

  const visible = useMemo(
    () => media.filter((m) => m.category === tab),
    [media, tab],
  )

  // Play videos only while in the viewport; pause (and stop downloading
  // ahead) as soon as they scroll out.
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const vids = Array.from(grid.querySelectorAll('video'))
    if (!vids.length) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement
          if (e.isIntersecting) v.play().catch(() => {})
          else v.pause()
        })
      },
      { threshold: 0.4 },
    )
    vids.forEach((v) => io.observe(v))
    return () => io.disconnect()
  }, [visible])

  return (
    <section className={`mediawall section ${className || ''}`.trim()} data-num={num} data-num-text={numText} id="media">
      <div className="contain">
        <div className="label r">Galleri</div>
        <h2 className="title r">
          Ögonblick <em>från familjen</em>
        </h2>

        <div className="mw-tabs r">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`mw-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
            >
              {t.label}
              <span className="mw-tab-count">{counts[t.key]}</span>
            </button>
          ))}
        </div>

        <div className="mw-grid r" ref={gridRef}>
          {visible.length === 0 && (
            <div className="mw-empty">
              Inga bilder ännu i denna kategori · Ladda upp via /studio
            </div>
          )}
          {/* Videos: preload nothing, play only while ~40% visible. Before
              this, every tile autoplayed at once → parallel multi-MB
              downloads and the "gallery is slow" complaint. */}
          {visible.map((m, i) => {
            const caption = m.captionSv || m.captionEn || m.title || ''
            // Every 5th tile gets the wider "feature" aspect for visual rhythm
            const wide = i > 0 && i % 5 === 2
            if (m.kind === 'video' && m.videoUrl) {
              return (
                <div
                  key={m._id}
                  className={`mw-tile${wide ? ' is-wide' : ''}`}
                >
                  <video
                    src={m.videoUrl}
                    poster={thumb(m.posterUrl, 800)}
                    muted
                    loop
                    playsInline
                    preload="none"
                  />
                  <div className="mw-badge">Video</div>
                  {caption && <div className="mw-caption">{caption}</div>}
                </div>
              )
            }
            return (
              <div key={m._id} className={`mw-tile${wide ? ' is-wide' : ''}`}>
                {m.imageUrl ? (
                  <img src={thumb(m.imageUrl, 800)} alt={caption || 'MBA'} loading="lazy" decoding="async" />
                ) : null}
                {caption && <div className="mw-caption">{caption}</div>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
