'use client'
import { useEffect, useState } from 'react'
import Crest from './Crest'

export default function Loader() {
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setGone(true), 1100)
    return () => clearTimeout(timer)
  }, [])

  // Cris asked (2026-05-12) for the splash to be just the crest — no MBA
  // wordmark, no "Malmö Basket Amatörer" subtitle. Cleaner, more cinematic.
  return (
    <div className={`loader${gone ? ' gone' : ''}`} id="loader">
      <div className="loader-crest">
        <Crest size={160} />
      </div>
    </div>
  )
}
