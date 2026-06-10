'use client'

/**
 * CinematicScroll — Tier-1 cinematic proof-of-concept.
 *
 * When NEXT_PUBLIC_CINEMATIC === '1':
 *   1. Lenis smooth-scroll.
 *   2. A scroll-driven MBA basketball (photoreal sprite from
 *      /public/cinematic/mba-ball.png, or the R3F 3D ball if
 *      NEXT_PUBLIC_CINEMATIC_3D === '1') that dribbles down the hero and fades out.
 *
 * Safety: feature-flagged, reduced-motion aware, pointer-events:none, self-cleaning.
 */
import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const Ball3D = dynamic(() => import('@/components/CinematicBall3D'), { ssr: false })
const USE_3D = process.env.NEXT_PUBLIC_CINEMATIC_3D === '1'

export default function CinematicScroll() {
  const ballRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let lenis: any
    const cleanupFns: Array<() => void> = []
    let cancelled = false

    ;(async () => {
      const [{ default: Lenis }, gsapMod, stMod] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return
      const gsap = gsapMod.gsap || gsapMod.default
      const ScrollTrigger = stMod.ScrollTrigger || stMod.default
      gsap.registerPlugin(ScrollTrigger)

      lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 })
      lenis.on('scroll', ScrollTrigger.update)
      const tick = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      cleanupFns.push(() => { gsap.ticker.remove(tick); lenis.destroy() })

      const ball = ballRef.current
      if (!ball) return
      const W = () => window.innerWidth
      const H = () => window.innerHeight

      gsap.set(ball, { x: W() * 0.5, y: H() * 0.14, rotation: 0, scale: 1, opacity: 0, force3D: true, xPercent: -50, yPercent: -50 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: document.documentElement, start: 0, end: () => H() * 2.4, scrub: 0.6, invalidateOnRefresh: true },
      })

      // fade in → gravity bounces → fade out
      tl.to(ball, { opacity: 1, duration: 0.12 }, 0)
        .to(ball, { x: () => W() * 0.30, y: () => H() * 0.62, ease: 'power2.in', duration: 1 }, 0)
        .to(ball, { x: () => W() * 0.22, y: () => H() * 0.40, ease: 'power1.out', duration: 0.7 })
        .to(ball, { x: () => W() * 0.68, y: () => H() * 0.72, ease: 'power2.in', duration: 1 })
        .to(ball, { x: () => W() * 0.74, y: () => H() * 0.55, ease: 'power1.out', duration: 0.6 })
        .to(ball, { x: () => W() * 0.50, y: () => H() * 0.86, ease: 'power2.in', duration: 0.9 })
        .to(ball, { opacity: 0, duration: 0.4 }, '>-0.1')

      if (!USE_3D) tl.to(ball, { rotation: 1080, ease: 'none', duration: 4.2 }, 0)

      cleanupFns.push(() => { tl.scrollTrigger?.kill(); tl.kill() })
      ScrollTrigger.refresh()
    })()

    return () => { cancelled = true; cleanupFns.forEach((fn) => fn()) }
  }, [])

  return (
    <>
      <style>{`
        html.lenis, html.lenis body { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto !important; }
        .lenis.lenis-stopped { overflow: hidden; }
      `}</style>
      <div
        ref={ballRef}
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 'clamp(56px, 8vw, 112px)', height: 'clamp(56px, 8vw, 112px)',
          pointerEvents: 'none', zIndex: 6, willChange: 'transform, opacity', opacity: 0,
          filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.35))',
        }}
      >
        {USE_3D ? (
          <Ball3D />
        ) : (
          <img src="/cinematic/mba-ball.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        )}
      </div>
    </>
  )
}
