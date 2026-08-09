'use client'

/**
 * TeamCollage — "FAMILJEN" scattered team-photo section (à la wondermakers.digital).
 *
 * Big centred title with photos scattered around it. Each photo:
 *   • fades IN as the section scrolls into view and fades OUT as it leaves
 *     (GSAP ScrollTrigger, scrubbed both directions — Cris 2026-08-02)
 *   • drifts with its own scroll parallax (GSAP)
 *   • floats gently and continuously (CSS keyframes)
 *   • is clickable → opens a full-size lightbox
 *
 * Images are served through thumb() (same-origin /_next/image proxy) instead
 * of hitting cdn.sanity.io directly — fixes the black-card bug on networks
 * that can't reach the Sanity CDN, and cuts multi-MB originals down to real
 * thumbnails. A card whose image still fails to load hides itself entirely
 * (onError) so we never show empty black frames.
 *
 * Safe: prefers-reduced-motion / GSAP-fail → static scattered collage still shows.
 *
 * id="media" — the Navbar "GALLERI" link points to /#media. MediaWall carries
 * this id in grid mode; in cinematic mode this section IS the gallery, so it
 * must carry the same anchor or the nav link silently does nothing.
 */
import { useEffect, useRef, useState } from 'react'
import { thumb } from '@/lib/sanity'

const SPOTS = [
  { l: 3,  t: 12, w: 19, r: -7, d: 80 },
  { l: 24, t: 56, w: 16, r: 5,  d: -110 },
  { l: 0,  t: 64, w: 15, r: 8,  d: 55 },
  { l: 78, t: 10, w: 19, r: 6,  d: 95 },
  { l: 84, t: 50, w: 16, r: -6, d: -85 },
  { l: 60, t: 66, w: 16, r: 5,  d: 120 },
  { l: 38, t: 2,  w: 15, r: -5, d: -60 },
  { l: 50, t: 70, w: 18, r: 4,  d: 80 },
  { l: 14, t: 32, w: 14, r: 7,  d: -50 },
  { l: 72, t: 30, w: 14, r: -8, d: 60 },
  { l: 30, t: 22, w: 13, r: 3,  d: -75 },
  { l: 66, t: 50, w: 13, r: -4, d: 70 },
  { l: 8,  t: 46, w: 13, r: 6,  d: 40 },
  { l: 88, t: 28, w: 12, r: -6, d: -55 },
]

export default function TeamCollage({
  images,
  label = 'FAMILJEN',
  title = 'FAMILJEN',
}: {
  images: string[]
  label?: string
  title?: string
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState<string | null>(null)
  const pics = (images || []).filter(Boolean).slice(0, SPOTS.length)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!pics.length) return
    let cleanup = () => {}
    let cancelled = false
    ;(async () => {
      const [g, s] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      if (cancelled) return
      const gsap = (g as any).gsap || (g as any).default
      const ScrollTrigger = (s as any).ScrollTrigger || (s as any).default
      gsap.registerPlugin(ScrollTrigger)
      const stage = stageRef.current
      const section = sectionRef.current
      if (!stage || !section) return
      const cards = Array.from(stage.querySelectorAll<HTMLElement>('.tc-card'))
      const tws: any[] = []
      cards.forEach((card) => {
        const d = Number(card.dataset.depth || 60)
        // Fade IN while the section scrolls into view…
        const tIn = gsap.fromTo(card, { autoAlpha: 0, scale: 0.8 }, {
          autoAlpha: 1, scale: 1, ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 80%', end: 'top 35%', scrub: 0.6 },
        })
        tws.push(tIn)
        // …and fade OUT as the section scrolls away (Cris 2026-08-02).
        const tOut = gsap.fromTo(card, { autoAlpha: 1 }, {
          autoAlpha: 0, scale: 0.92, ease: 'power1.in', immediateRender: false,
          scrollTrigger: { trigger: section, start: 'bottom 55%', end: 'bottom 18%', scrub: 0.6 },
        })
        tws.push(tOut)
        // Per-card parallax drift.
        const t = gsap.fromTo(card, { y: d }, {
          y: -d, ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        })
        tws.push(t)
      })
      cleanup = () => tws.forEach((t) => { t.scrollTrigger?.kill?.(); t.kill?.() })
    })()
    return () => { cancelled = true; cleanup() }
  }, [pics.length])

  // Esc closes the lightbox
  useEffect(() => {
    if (!zoom) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoom(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoom])

  if (!pics.length) return null

  return (
    <section ref={sectionRef} id="media" className="section section-dark" style={{ height: '200vh', position: 'relative' }}>
      <style>{`@keyframes tcFloat { 0%,100% { transform: translateY(-10px); } 50% { transform: translateY(10px); } }`}</style>

      <div ref={stageRef} style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        {/* centred big title */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1, textAlign: 'center', pointerEvents: 'none' }}>
          <div className="label" style={{ marginBottom: 14, opacity: 0.85 }}>{label}</div>
          <h2 style={{ margin: 0, color: '#fff', fontFamily: 'Inter Tight, Arial Black, sans-serif', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.02em', fontSize: 'clamp(64px, 15vw, 280px)', textTransform: 'uppercase' }}>{title}</h2>
        </div>

        {/* scattered floating photos */}
        {pics.map((src, i) => {
          const sp = SPOTS[i % SPOTS.length]
          return (
            <div
              key={i}
              className="tc-card"
              data-depth={sp.d}
              onClick={() => setZoom(src)}
              style={{
                position: 'absolute', left: `${sp.l}%`, top: `${sp.t}%`,
                width: `clamp(150px, ${sp.w}vw, 380px)`, zIndex: 2, cursor: 'zoom-in',
              }}
            >
              <div style={{ animation: `tcFloat ${5 + (i % 5) * 0.7}s ease-in-out ${i * 0.35}s infinite` }}>
                <div style={{ transform: `rotate(${sp.r}deg)`, borderRadius: 14, overflow: 'hidden', border: '5px solid #fff', boxShadow: '0 22px 55px rgba(0,0,0,0.55)', background: '#111', transition: 'transform .25s ease' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb(src, 640)}
                    alt=""
                    loading={i < 4 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={(e) => {
                      // Image unreachable → hide the whole card instead of
                      // showing an empty black frame.
                      const card = (e.currentTarget as HTMLElement).closest('.tc-card') as HTMLElement | null
                      if (card) card.style.display = 'none'
                    }}
                    style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* lightbox — larger proxied rendition, still same-origin */}
      {zoom && (
        <div
          onClick={() => setZoom(null)}
          role="dialog"
          aria-label="Foto"
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(8,12,22,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '4vh' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb(zoom, 1920)} alt="" style={{ maxWidth: '92vw', maxHeight: '92vh', borderRadius: 12, border: '4px solid #fff', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }} />
          <button
            onClick={() => setZoom(null)}
            aria-label="Stäng"
            style={{ position: 'fixed', top: 24, right: 28, fontSize: 34, lineHeight: 1, color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >×</button>
        </div>
      )}
    </section>
  )
}
