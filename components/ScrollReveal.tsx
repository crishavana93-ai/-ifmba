'use client'
import { useEffect, useRef } from 'react'

/**
 * Wraps a section and fades it in when it scrolls into view.
 *
 * The wrapper itself gets `.r` → `.v`, AND every descendant carrying
 * the `.r` class gets `.v` added too (staggered by 60ms). Without this
 * descendant sweep, label/title/card elements inside the section stay
 * at `opacity: 0` forever and the section looks blank.
 */
export default function ScrollReveal({
  children,
  className = 'r',
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reveal = () => {
      el.classList.add('v')
      const inner = el.querySelectorAll<HTMLElement>('.r:not(.v)')
      inner.forEach((node, i) => {
        const delay = Math.min(i * 60, 600)
        window.setTimeout(() => node.classList.add('v'), delay)
      })
    }

    // If the section is already in the viewport on mount, reveal immediately.
    // (IntersectionObserver sometimes misses initial state in fast-routed pages.)
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      reveal()
      return
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal()
          obs.unobserve(el)
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    )
    obs.observe(el)

    // Safety: if the section is still hidden 2.5s after mount (edge cases
    // like prefers-reduced-motion, observer never firing, etc.), force reveal.
    const fallback = window.setTimeout(() => {
      if (!el.classList.contains('v')) reveal()
    }, 2500)

    return () => {
      obs.disconnect()
      window.clearTimeout(fallback)
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
