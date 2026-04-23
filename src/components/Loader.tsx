'use client'
import { useEffect, useState } from 'react'

export default function Loader() {
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setGone(true), 900)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`loader${gone ? ' gone' : ''}`} id="loader">
      <div className="loader-word">
        <span style={{ animationDelay: '0.05s' }}>M</span>
        <span style={{ animationDelay: '0.10s' }}>B</span>
        <span style={{ animationDelay: '0.15s', color: 'var(--sky-deep)' }}>A</span>
      </div>
      <div className="loader-sub">Malmö Basket</div>
    </div>
  )
}
