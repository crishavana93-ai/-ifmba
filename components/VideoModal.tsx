/**
 * VideoModal — fullscreen lightbox for highlight clips.
 *
 * Opens when a user clicks a Highlights card. Plays the video with native
 * controls, sound on by default, autoplay. Closes on backdrop click, ESC,
 * or the close button. Locks body scroll while open.
 */
'use client'
import { useEffect, useRef } from 'react'

type Props = {
  src: string
  poster?: string
  title?: string
  onClose: () => void
}

export default function VideoModal({ src, poster, title, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Lock body scroll + ESC-to-close.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    // Autoplay with sound — browsers sometimes block this; fall back to muted.
    const v = videoRef.current
    if (v) {
      v.muted = false
      v.play().catch(() => {
        v.muted = true
        v.play().catch(() => {})
      })
    }
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="vm-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Video highlight'}
      onClick={(e) => {
        // Close if the click landed on the backdrop itself (not the video box).
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button
        type="button"
        className="vm-close"
        onClick={onClose}
        aria-label="Stäng"
      >
        ✕
      </button>
      <div className="vm-frame" onClick={(e) => e.stopPropagation()}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          playsInline
          autoPlay
        />
        {title && <div className="vm-title">{title}</div>}
      </div>
    </div>
  )
}
