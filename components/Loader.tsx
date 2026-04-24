'use client'
import { useEffect, useState } from 'react'
import Crest from './Crest'

export default function Loader() {
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setGone(true), 1100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`loader${gone ? ' gone' : ''}`} id="loader">
      <div className="loader-crest">
        <Crest size={120} />
      </div>
      <div className="loader-word">
        <span style={{ animationDelay: '0.05s' }}>M</span>
        <span style={{ animationDelay: '0.10s' }}>B</span>
        <span style={{ animationDelay: '0.15s' }}>A</span>
      </div>
      <div className="loader-sub">Malmö Basket Amatörer</div>
    </div>
  )
}
