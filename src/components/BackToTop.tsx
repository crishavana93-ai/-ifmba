'use client'
import { useEffect, useState } from 'react'

export default function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      className={`btt${show ? ' show' : ''}`}
      onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}
    >
      &#8593;
    </button>
  )
}
