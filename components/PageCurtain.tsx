'use client'

/**
 * PageCurtain — gold "curtain" page transition.
 *
 * On every route change, a navy + gold panel sweeps across the screen (cover
 * left→right, then reveal right→left) with the MBA mark — the betclic
 * "loader-between-scenes" feel. Mounted once in layout, behind
 * NEXT_PUBLIC_CINEMATIC.
 *
 * Notes:
 *   - Skips the very first load (no curtain on initial paint).
 *   - prefers-reduced-motion → no animation.
 *   - pointer-events:none except during the sweep; aria-hidden.
 *   - Self-contained; uses GSAP (already in the project).
 */
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function PageCurtain() {
  const panelRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Don't run on the initial mount — only on subsequent navigations.
    if (first.current) {
      first.current = false
      return
    }
    const panel = panelRef.current
    if (!panel) return
    let cancelled = false

    ;(async () => {
      const g = await import('gsap')
      if (cancelled) return
      const gsap = (g as any).gsap || (g as any).default

      gsap.killTweensOf(panel)
      gsap.set(panel, { display: 'block', transformOrigin: 'left center', scaleX: 0 })
      gsap
        .timeline()
        .to(panel, { scaleX: 1, duration: 0.42, ease: 'power3.inOut' })
        .set(panel, { transformOrigin: 'right center' })
        .to(panel, { scaleX: 0, duration: 0.5, ease: 'power3.inOut' })
        .set(panel, { display: 'none' })
    })()

    return () => {
      cancelled = true
    }
  }, [pathname])

  return (
    <div
      ref={panelRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'none',
        transform: 'scaleX(0)',
        pointerEvents: 'none',
        background: 'linear-gradient(120deg, #0B1220 0%, #14315c 55%, #FFCB05 55%, #FFCB05 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFCB05',
          fontFamily: 'Arial Black, Arial, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(40px, 8vw, 120px)',
          letterSpacing: '0.05em',
          mixBlendMode: 'difference',
        }}
      >
        MBA
      </div>
    </div>
  )
}
