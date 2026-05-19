'use client'
/**
 * RotationViewer — drag-to-spin 360° viewer over 7 photographed model angles.
 *
 * The architecture changed 2026-05-19:
 *   OLD: rendered the model frame + the design as a separate CSS overlay,
 *        chroma-keyed in the browser canvas. Caused white-box and skew
 *        distortion artifacts on ¾ angles.
 *   NEW: each frame is rendered by the server-side compositor at
 *        /api/mockup/[productId]/[frame].webp. The server fetches the
 *        cleanDesign from Sanity, chroma-keys it, applies per-frame
 *        chest-area positioning + perspective, and returns a pre-baked
 *        WebP. This file just swaps which composited frame to show.
 *
 *   When no product is selected, we fall back to the raw blank-tee
 *   frames in /public/lifestyle/rotation/.
 *
 * UX:
 *   - Drag horizontally (mouse or touch) to scrub through the 7 frames
 *   - Auto-rotates slowly when idle so visitors notice the interactivity
 *   - On product change: 7 frames are preloaded so dragging is instant
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Product = {
  _id: string
  /** Sanity's auto-tracked last-edit timestamp. Used as a cache-bust param
   *  in the /api/mockup URLs — every product edit changes _updatedAt, which
   *  changes the URL, which forces Vercel's CDN to re-render. Without this
   *  the CDN would serve stale mockups forever after first render. */
  _updatedAt?: string
  name: string
  imageUrl?: string | null
  cleanDesignUrl?: string | null
  priceSek: number
}

const FRAME_COUNT = 7
const BLANK_FRAMES = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/lifestyle/rotation/frame-${String(i).padStart(2, '0')}.webp`,
)

export default function RotationViewer({
  product,
  className,
}: {
  /** The active product whose design we composite onto each frame. */
  product: Product | null
  className?: string
}) {
  const [idx, setIdx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const dragStart = useRef({ x: 0, startIdx: 0 })

  // Frames to render — either the bare model (no product) or the server-
  // composited versions (product selected). The compositor returns the
  // bare frame for "design not visible on this angle" so all 7 entries
  // are always populated; viewer doesn't need a fallback path.
  const frames = useMemo(() => {
    if (!product?._id) return BLANK_FRAMES
    // _updatedAt → URL cache-bust. Any product edit (cleanDesign upload,
    // position change, name edit) produces a new URL, busting Vercel's
    // CDN cache instantly. Without this, edits never reach customers
    // because the previous URL is cached for a year.
    const cacheKey = product._updatedAt ? `?u=${encodeURIComponent(product._updatedAt)}` : ''
    return Array.from(
      { length: FRAME_COUNT },
      (_, i) => `/api/mockup/${encodeURIComponent(product._id)}/${i}.webp${cacheKey}`,
    )
  }, [product?._id, product?._updatedAt])

  // Preload all frames so dragging is instant after product change.
  // Browser-native `<link rel="preload">` would be cleaner but doesn't
  // play well with API routes; using Image() works in all browsers and
  // primes the HTTP cache for the <img> tag below.
  useEffect(() => {
    frames.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [frames])

  // Idle auto-rotate — slowly cycles through frames until user interacts
  useEffect(() => {
    if (hasInteracted) return
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % FRAME_COUNT)
    }, 850)
    return () => clearInterval(id)
  }, [hasInteracted])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      setHasInteracted(true)
      setDragging(true)
      dragStart.current = { x: e.clientX, startIdx: idx }
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    },
    [idx],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging) return
      const dx = e.clientX - dragStart.current.x
      // 50px of horizontal drag = 1 frame change. Drag right → rotate clockwise.
      const delta = Math.round(dx / 50)
      let next = (dragStart.current.startIdx + delta) % FRAME_COUNT
      if (next < 0) next += FRAME_COUNT
      setIdx(next)
    },
    [dragging],
  )

  const handlePointerUp = useCallback(() => {
    setDragging(false)
  }, [])

  return (
    <div
      className={`rot-viewer ${className || ''}`.trim()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ cursor: dragging ? 'grabbing' : 'grab' }}
    >
      {/* The composited frame — design baked in by the server when a
          product is selected, bare model otherwise. */}
      <img
        className="rot-viewer-frame"
        src={frames[idx]}
        alt={product ? `${product.name} on model` : 'MBA model rotation'}
        draggable={false}
      />

      {/* Drag hint — fades out once user has interacted */}
      {!hasInteracted && (
        <div className="rot-viewer-hint" aria-hidden="true">
          ↔ Dra för att rotera
        </div>
      )}
    </div>
  )
}
