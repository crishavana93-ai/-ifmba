'use client'
import { useEffect, useRef } from 'react'

function animateCount(el: HTMLElement) {
  const target = parseInt(el.dataset.count || '0')
  if (!target) return
  const dur = 1100
  const start = performance.now()
  el.textContent = '0'
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
  const nations = new Set(players.map((p: any) => p.nationality).filter(Boolean)).size
  const wins = mba?.wins ?? 0
  const losses = mba?.losses ?? 0
  const position = mba?.position ?? 1

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('v')
        if (!prefersReduced) {
          el.querySelectorAll<HTMLElement>('[data-count]').forEach(animateCount)
        }
        obs.unobserve(el)
      }
    }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div className="stats-bar r" ref={ref}>
      <div className="stat d1"><div className="stat-num" data-count={players.length}>{players.length}</div><div className="stat-lbl">Spelare</div></div>
      <div className="stat d2"><div className="stat-num"><span data-count={wins}>{wins}</span>–<span data-count={losses}>{losses}</span></div><div className="stat-lbl">V – F</div></div>
      <div className="stat d3"><div className="stat-num" data-count={nations}>{nations}</div><div className="stat-lbl">Nationaliteter</div></div>
      <div className="stat d4"><div className="stat-num"><em>#<span data-count={position}>{position}</span></em></div><div className="stat-lbl">I tabellen</div></div>
    </div>
  )
}
