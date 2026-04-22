'use client'
import { useEffect, useState } from 'react'

export default function Countdown({ date, opponent, venue }: { date: string; opponent: string; venue: string }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    const target = new Date(date).getTime()
    const tick = () => {
      const diff = Math.max(0, target - Date.now())
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [date])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <section className="drop" id="drop">
      <div className="contain drop-inner">
        <div className="drop-header r">
          <span className="drop-live-dot" />
          <span className="drop-label">Nästa tip-off</span>
        </div>
        <h2 className="drop-matchup r">MBA <em>vs</em> {opponent}</h2>
        <div className="drop-meta r">
          <span>{venue}</span>
          <span className="drop-sep">·</span>
          <span>{new Date(date).toLocaleDateString('sv-SE', { weekday:'short', day:'numeric', month:'short' })} · {new Date(date).toLocaleTimeString('sv-SE', { hour:'2-digit', minute:'2-digit' })}</span>
        </div>
        <div className="drop-grid r">
          <div className="drop-unit"><div className="drop-num">{pad(time.d)}</div><div className="drop-lbl">Dagar</div></div>
          <div className="drop-unit"><div className="drop-num">{pad(time.h)}</div><div className="drop-lbl">Timmar</div></div>
          <div className="drop-unit"><div className="drop-num">{pad(time.m)}</div><div className="drop-lbl">Minuter</div></div>
          <div className="drop-unit"><div className="drop-num">{pad(time.s)}</div><div className="drop-lbl">Sekunder</div></div>
        </div>
      </div>
    </section>
  )
}
