'use client'

/**
 * Reveal — GSAP-powered scroll reveal with presets.
 *
 * Drop-in upgrade for the flat-fade ScrollReveal. Wrap any block and pick a
 * preset; each section can animate differently as it scrolls into view:
 *
 *   <Reveal anim="fade-up">…</Reveal>     slide up + fade   (default)
 *   <Reveal anim="wipe">…</Reveal>        clip-path reveal
 *   <Reveal anim="scale">…</Reveal>       gentle zoom-in
 *   <Reveal anim="stagger">…</Reveal>     children animate in sequence
 *   <Reveal anim="parallax">…</Reveal>    drifts as you scroll past (scrubbed)
 *
 * Safe by design:
 *   - prefers-reduced-motion → renders children with no animation.
 *   - If GSAP fails to load, children still show (content is never hidden by CSS).
 *   - Self-cleans its ScrollTrigger on unmount.
 *
 * Tune speed/distance in ONE place here and every section follows.
 */
import { useEffect, useRef } from 'react'

type Anim = 'fade-up' | 'fade' | 'wipe' | 'scale' | 'stagger' | 'parallax'

export default function Reveal({
  children,
  anim = 'fade-up',
  stagger = 0.12,
  start = 'top 82%',
  className,
}: {
  children: React.ReactNode
  anim?: Anim
  stagger?: number
  start?: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let cleanup = () => {}
    let cancelled = false

    ;(async () => {
      const [g, s] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      if (cancelled) return
      const gsap = (g as any).gsap || (g as any).default
      const ScrollTrigger = (s as any).ScrollTrigger || (s as any).default
      gsap.registerPlugin(ScrollTrigger)
      const el = ref.current
      if (!el) return

      const st = { trigger: el, start, toggleActions: 'play none none reverse' }
      let tween: any

      if (anim === 'stagger') {
        tween = gsap.from(el.children, {
          y: 42, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger, scrollTrigger: st,
        })
      } else if (anim === 'parallax') {
        tween = gsap.fromTo(
          el,
          { yPercent: 8 },
          { yPercent: -8, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      } else if (anim === 'wipe') {
        tween = gsap.from(el, {
          clipPath: 'inset(0 0 100% 0)', duration: 0.95, ease: 'power3.out', scrollTrigger: st,
        })
      } else if (anim === 'scale') {
        tween = gsap.from(el, { scale: 0.92, autoAlpha: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: st })
      } else {
        tween = gsap.from(el, {
          y: anim === 'fade' ? 0 : 50, autoAlpha: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: st,
        })
      }

      cleanup = () => {
        tween?.scrollTrigger?.kill?.()
        tween?.kill?.()
      }
    })()

    return () => {
      cancelled = true
      cleanup()
    }
  }, [anim, stagger, start])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
