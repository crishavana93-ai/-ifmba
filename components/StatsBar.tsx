'use client'
import { useEffect, useRef } from 'react'

function animateCount(el: HTMLElement) {
  const target = parseInt(el.dataset.count || '0')
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
  const mba = standings.find((s: any) => s.isUs)
  const nations = new Set(players.map((p: any) => p.nationality)).size

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('v')
        el.querySelectorAll<HTMLElement>('[data-count]').forEach(animateCount)
        obs.unobserve(el)
      }
    }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div className="stats-bar r" ref={ref}>
      <div className="stat d1"><div className="stat-num" data-count={players.length}>0</div><div className="stat-lbl">Spelare</div></div>
      <div className="stat d2"><div className="stat-num"><span data-count={mba?.wins || 0}>0</span>–<span data-count={mba?.losses || 0}>0</span></div><div className="stat-lbl">V – F</div></div>
      <div className="stat d3"><div className="stat-num" data-count={nations}>0</div><div className="stat-lbl">Nationaliteter</div></div>
      <div className="stat d4"><div className="stat-num"><em>#<span data-count={mba?.position || 1}>0</span></em></div><div className="stat-lbl">I tabellen</div></div>
    </div>
  )
}
