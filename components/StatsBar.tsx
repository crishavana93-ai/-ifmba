'use client'
import { useEffect, useRef, useState } from 'react'

function animateCount(el: HTMLElement) {
  const target = parseInt(el.dataset.count || '0')
  if (target === 0) { el.textContent = '0'; return }
  const dur = 1100
  const start = performance.now()
  const tick = (now: number) => {
    const p = Math.min((now - start) / dur, 1)
    const e = 1 - Math.pow(1 - p, 3)
    el.textContent = String(Math.round(target * e))
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

export default function StatsBar({ players, standings }: { players: any[]; standings: any[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [animated, setAnimated] = useState(false)
  const mba = standings?.find((s: any) => s.isUs)
  const nations = players?.length ? new Set(players.map((p: any) => p.nationality)).size : 0

  useEffect(() => {
    const el = ref.current
    if (!el || animated) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setAnimated(true)
        el.querySelectorAll<HTMLElement>('[data-count]').forEach(animateCount)
        obs.unobserve(el)
      }
    }, { threshold: 0.05 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [animated, players, standings])

  return (
    <div className="stats-bar" ref={ref} style={{ opacity: 1, transform: 'none' }}>
      <div className="stat d1"><div className="stat-num" data-count={players?.length || 0}>0</div><div className="stat-lbl">Spelare</div></div>
      <div className="stat d2"><div className="stat-num"><span data-count={mba?.wins || 0}>0</span>–<span data-count={mba?.losses || 0}>0</span></div><div className="stat-lbl">V – F</div></div>
      <div className="stat d3"><div className="stat-num" data-count={nations}>0</div><div className="stat-lbl">Nationaliteter</div></div>
      <div className="stat d4"><div className="stat-num"><em>#<span data-count={mba?.position || 0}>0</span></em></div><div className="stat-lbl">I tabellen</div></div>
    </div>
  )
}
