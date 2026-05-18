'use client'
/**
 * RotationViewer — drag-to-spin 360° viewer using 8 frames extracted from
 * a real-life video shoot.
 *
 * UX:
 *   - Drag horizontally (mouse or touch) to scrub through the 8 frames
 *   - Auto-rotates slowly when idle so visitors notice the interactivity
 *   - When a product is "active", its design image overlays on the chest
 *     area — opacity ties to the current frame so the overlay fades as the
 *     model turns away from camera (visible front 3 frames, hidden back 3,
 *     fading on sides). Crude but effective until per-frame perspective
 *     positions are tuned by hand.
 *
 * Frame source: /public/lifestyle/rotation/frame-{00..07}.webp
 * Extracted from /Users/cristianortizsuarez/Documents/MBA/rotation-video.mp4
 * at 2.53s intervals via `ffmpeg -ss <ts> -i video.mp4 -frames:v 1 ...`
 *
 * To re-shoot: drop a new video at the same path and re-run the extract
 * step from the deploy script (TODO: bake that into sync-and-deploy.sh).
 */

import { useCallback, useEffect, useRef, useState } from 'react'

type Product = {
  _id: string
  name: string
  imageUrl?: string | null
  priceSek: number
}

const FRAME_COUNT = 8
const FRAMES = Array.from({ length: FRAME_COUNT }, (_, i) =>
  `/lifestyle/rotation/frame-${String(i).padStart(2, '0')}.webp`,
)

/** Opacity multiplier per frame for the design overlay.
 *  Index 0 = front (full visible), index 4 = back (hidden), others fade.
 *  Tweak these by feel — they assume the model rotated clockwise.
 */
const OVERLAY_OPACITY = [1.0, 0.85, 0.35, 0.0, 0.0, 0.0, 0.35, 0.85]

/** Horizontal offset (px) of the design overlay per frame.
 *  Model's chest stays roughly centered but shifts slightly with rotation. */
const OVERLAY_X_OFFSET = [0, -8, -22, 0, 0, 0, 22, 8]

/** SkewX angle (deg) per frame — fakes the body's rotation under the design. */
const OVERLAY_SKEW = [0, -8, -22, 0, 0, 0, 22, 8]

export default function RotationViewer({
  product,
  className,
}: {
  /** The active product whose design overlays on the chest. Pass null to
   *  show the model without any overlay. */
  product: Product | null
  className?: string
}) {
  const [idx, setIdx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const dragStart = useRef({ x: 0, startIdx: 0 })

  // Preload all frames so dragging is instant (no flicker mid-scrub)
  useEffect(() => {
    FRAMES.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

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

  const overlayOpacity = OVERLAY_OPACITY[idx] ?? 0
  const overlayX = OVERLAY_X_OFFSET[idx] ?? 0
  const overlaySkew = OVERLAY_SKEW[idx] ?? 0

  return (
    <div
      className={`rot-viewer ${className || ''}`.trim()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ cursor: dragging ? 'grabbing' : 'grab' }}
    >
      {/* The model frame */}
      <img
        className="rot-viewer-frame"
        src={FRAMES[idx]}
        alt="MBA model rotation"
        draggable={false}
      />

      {/* Design overlay on chest — only renders if a product is active.
          Position/scale are tuned for this specific shoot — re-tune if you
          re-shoot with a different model or camera distance. */}
      {product?.imageUrl && overlayOpacity > 0 && (
        <div
          className="rot-viewer-design"
          style={{
            opacity: overlayOpacity,
            transform: `translate(calc(-50% + ${overlayX}px), -50%) skewX(${overlaySkew}deg)`,
          }}
        >
          <img src={product.imageUrl} alt={product.name} draggable={false} />
        </div>
      )}

      {/* Drag hint — fades out once user has interacted */}
      {!hasInteracted && (
        <div className="rot-viewer-hint" aria-hidden="true">
          ↔ Dra för att rotera
        </div>
      )}
    </div>
  )
}
