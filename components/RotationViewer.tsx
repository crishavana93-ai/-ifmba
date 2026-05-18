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

// 7 frames (replaced the 8 video-extracted frames with Gemini-generated
// composite + standalone front + side, 2026-05-18). Indexed:
//   0 — front (face camera)
//   1 — ¾-right (~51° rotated)
//   2 — ¾-back-right (~103°)
//   3 — full back (~154°)
//   4 — ¾-back-left (~206°)
//   5 — ¾-left (~257°)
//   6 — side profile (~309°)
const FRAME_COUNT = 7
const FRAMES = Array.from({ length: FRAME_COUNT }, (_, i) =>
  `/lifestyle/rotation/frame-${String(i).padStart(2, '0')}.webp`,
)

/** Opacity multiplier per frame for the design overlay.
 *  Front (0) = full visible · turned-away frames (2,3,4) = hidden ·
 *  3/4 angles (1, 5) = partial · side (6) = chest perpendicular, hidden. */
const OVERLAY_OPACITY = [1.0, 0.65, 0.15, 0.0, 0.0, 0.55, 0.0]

/** Horizontal offset (px) per frame — design shifts as body rotates. */
const OVERLAY_X_OFFSET = [0, -14, -28, 0, 0, 24, 0]

/** SkewX angle (deg) per frame — fakes 3D body rotation under the design. */
const OVERLAY_SKEW = [0, -10, -22, 0, 0, 16, 0]

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
  // Cleaned design (background-removed) for the current product.
  // We chroma-key the corner pixel and make matching colors transparent
  // so the overlay shows JUST the print, not the AliExpress shirt outline.
  const [cleanedDesignUrl, setCleanedDesignUrl] = useState<string | null>(null)

  // When the active product changes, do live background removal on its image
  // and use the cleaned PNG as the overlay source. Same chroma-key algorithm
  // as the admin Mockup Studio, but runs automatically on every click.
  useEffect(() => {
    if (!product?.imageUrl) { setCleanedDesignUrl(null); return }
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelled) return
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      try {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
        // Sample the corner pixels — average them as the bg color
        const samples = [
          0,
          (canvas.width - 1) * 4,
          (canvas.height - 1) * canvas.width * 4,
          ((canvas.height - 1) * canvas.width + canvas.width - 1) * 4,
        ]
        let bgR = 0, bgG = 0, bgB = 0
        for (const i of samples) {
          bgR += data.data[i]
          bgG += data.data[i + 1]
          bgB += data.data[i + 2]
        }
        bgR /= 4; bgG /= 4; bgB /= 4
        const TOL = 55
        for (let i = 0; i < data.data.length; i += 4) {
          const r = data.data[i], g = data.data[i + 1], b = data.data[i + 2]
          const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2)
          if (dist < TOL) {
            data.data[i + 3] = 0
          } else if (dist < TOL * 1.5) {
            data.data[i + 3] = Math.round(255 * ((dist - TOL) / (TOL * 0.5)))
          }
        }
        ctx.putImageData(data, 0, 0)
        setCleanedDesignUrl(canvas.toDataURL('image/png'))
      } catch (err) {
        // CORS-tainted canvas — fall back to raw image
        console.warn('[RotationViewer] chroma-key skipped, using raw image:', err)
        setCleanedDesignUrl(product.imageUrl!)
      }
    }
    img.onerror = () => setCleanedDesignUrl(product.imageUrl!)
    img.src = product.imageUrl
    return () => { cancelled = true }
  }, [product?.imageUrl])

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

      {/* Design overlay on chest — uses the chroma-keyed (background-removed)
          version of the product image so we only see the print, not the
          AliExpress shirt outline. The cleaning happens in a useEffect when
          the product changes. */}
      {cleanedDesignUrl && overlayOpacity > 0 && (
        <div
          className="rot-viewer-design"
          style={{
            opacity: overlayOpacity,
            transform: `translate(calc(-50% + ${overlayX}px), -50%) skewX(${overlaySkew}deg)`,
          }}
        >
          <img src={cleanedDesignUrl} alt={product?.name || ''} draggable={false} />
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
