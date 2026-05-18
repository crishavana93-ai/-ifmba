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
        const w = canvas.width
        const h = canvas.height

        // Multi-point chroma-key: sample 8 perimeter points (4 corners + 4
        // mid-edges) as DISTINCT background colors. Removes any pixel close
        // to ANY sample. This handles designs with two bg layers — photo
        // background (white, sampled from true corners) + t-shirt fabric
        // (black/dark, sampled from mid-edges where the shirt is visible).
        const sampleAt = (x: number, y: number): [number, number, number] => {
          const i = (y * w + x) * 4
          return [data.data[i], data.data[i + 1], data.data[i + 2]]
        }
        const samples: Array<[number, number, number]> = [
          sampleAt(0, 0),
          sampleAt(w - 1, 0),
          sampleAt(0, h - 1),
          sampleAt(w - 1, h - 1),
          sampleAt(Math.floor(w / 2), 0),
          sampleAt(Math.floor(w / 2), h - 1),
          sampleAt(0, Math.floor(h / 2)),
          sampleAt(w - 1, Math.floor(h / 2)),
        ]

        // 80 = handles AliExpress dual-bg photos (white photo margin +
        // dark shirt fabric) out of the box. Higher than the 60 we had
        // before — was leaving black halos around print silhouettes.
        const TOL = 80
        for (let i = 0; i < data.data.length; i += 4) {
          const r = data.data[i], g = data.data[i + 1], b = data.data[i + 2]
          let minDist = Infinity
          for (const [sr, sg, sb] of samples) {
            const d = Math.sqrt((r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2)
            if (d < minDist) minDist = d
            if (d < TOL) break // early exit
          }
          if (minDist < TOL) {
            data.data[i + 3] = 0
          } else if (minDist < TOL * 1.5) {
            data.data[i + 3] = Math.round(255 * ((minDist - TOL) / (TOL * 0.5)))
          }
        }
        ctx.putImageData(data, 0, 0)

        // Auto-trim the transparent borders. After chroma-key, the actual print
        // is often only the middle 40-60% of the source photo — trimming lets
        // the overlay's CSS width % map to the PRINT, not the empty padding.
        let minX = w, minY = h, maxX = -1, maxY = -1
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (data.data[(y * w + x) * 4 + 3] > 20) {
              if (x < minX) minX = x
              if (x > maxX) maxX = x
              if (y < minY) minY = y
              if (y > maxY) maxY = y
            }
          }
        }
        if (maxX > minX && maxY > minY) {
          const tw = maxX - minX + 1
          const th = maxY - minY + 1
          const out = document.createElement('canvas')
          out.width = tw
          out.height = th
          out.getContext('2d')!.drawImage(canvas, minX, minY, tw, th, 0, 0, tw, th)
          setCleanedDesignUrl(out.toDataURL('image/png'))
        } else {
          setCleanedDesignUrl(canvas.toDataURL('image/png'))
        }
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
