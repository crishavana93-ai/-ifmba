/**
 * /api/mockup/[productId]/[frame] — server-side mockup compositor.
 *
 * The Printful approach, ported to MBA: for each product, pre-render a
 * PNG per rotation frame with the design composited at the right chest
 * area + perspective. The RotationViewer then loads these pre-rendered
 * frames as plain <img> tags — no CSS skew, no client-side chroma-key,
 * no white-box artifacts.
 *
 * Pipeline (per request):
 *   1. Load the base rotation frame from /public/lifestyle/rotation/
 *   2. Look up the product's cleanDesign (or imageUrl fallback) via Sanity
 *   3. Fetch the design PNG, strip background pixels with sharp's alpha
 *      removal (handles uploads that aren't quite transparent)
 *   4. Resize + horizontally compress per FRAME_SPECS[frame].scaleX
 *   5. Composite onto the frame at FRAME_SPECS[frame] chest position
 *   6. Return PNG with year-long Cache-Control (URL is stable per product
 *      until the cleanDesign asset id changes)
 *
 * Why server-side instead of CSS overlay: chest perspective on ¾ angles
 * cannot be faked convincingly in CSS. Server-side compositing with
 * sharp gives pixel-perfect results that match the rotation frame's
 * actual perspective. Vercel caches the response forever (URL keyed),
 * so we pay the ~200ms render cost once per (product, frame) — every
 * subsequent visit is a CDN hit.
 */
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { FRAME_SPECS, FRAME_WIDTH, FRAME_HEIGHT, FRAME_COUNT } from '@/lib/mockup-frames'

// Node runtime required — sharp doesn't run on the Vercel Edge runtime.
export const runtime = 'nodejs'
// Frame URL is stable per product asset; cache aggressively at the CDN.
export const revalidate = 31536000 // 1 year

const SANITY_PROJECT = '3zuy5n8l'
const SANITY_DATASET = 'production'

async function getProductDesignUrl(productId: string): Promise<string | null> {
  // Query Sanity for the product's cleanDesignUrl (preferred) or imageUrl.
  // Public reads don't need a token.
  const query = encodeURIComponent(
    `*[_type=="dropshipProduct" && _id=="${productId.replace(/"/g, '')}"][0]{"clean": cleanDesign.asset->url, "raw": image.asset->url}`,
  )
  const url = `https://${SANITY_PROJECT}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=${query}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) return null
  const json = await res.json()
  return json?.result?.clean || json?.result?.raw || null
}

/**
 * Multi-point chroma-key: turn background pixels transparent.
 *
 * Three-stage logic:
 *   1. Detect if the input is ALREADY transparent (>10% pixels with alpha
 *      < 250). If yes, return it as-is — admin has already cleaned this
 *      design (via remove.bg or similar), and running chroma-key on a
 *      clean PNG will only damage it by erasing print pixels that
 *      happen to match the bg color near edges. This matches what the
 *      admin's local editor does when "remove bg" checkbox is unchecked.
 *   2. Otherwise, sample 16 points (8 perimeter + 8 inset) for bg colors.
 *      Perimeter catches photo background (white/grey); inset catches
 *      shirt fabric (usually dark).
 *   3. Make every pixel within `TOL` RGB distance of any sample
 *      transparent, with a soft 1.5× fade edge to avoid hard cuts.
 */
async function chromaKeyToTransparent(input: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  })
  const out = Buffer.from(data)
  const w = info.width
  const h = info.height

  // STAGE 1: alpha detection. Count pixels that are at least partially
  // transparent. If a significant fraction is already transparent, the
  // image was deliberately cleaned by the admin — trust it, don't touch.
  let transparentCount = 0
  const totalPixels = w * h
  for (let i = 3; i < out.length; i += 4) {
    if (out[i] < 250) transparentCount++
  }
  const transparentRatio = transparentCount / totalPixels
  if (transparentRatio > 0.10) {
    // Already transparent enough — return original PNG unchanged.
    // (Re-encoding here is harmless but preserves the exact pixels.)
    return sharp(out, {
      raw: { width: w, height: h, channels: 4 },
    }).png().toBuffer()
  }
  const px = (x: number, y: number): [number, number, number] => {
    const i = (y * w + x) * 4
    return [out[i], out[i + 1], out[i + 2]]
  }
  // ALWAYS sample 8 perimeter + 8 inset points. Perimeter catches the
  // outer photo background (white/grey usually). Insets catch the shirt
  // fabric color, which on basketball merch is almost always dark/black.
  // The previous "only if all perimeter is light" heuristic was too strict
  // — a single dark pixel on any corner (e.g., shirt extending to edge)
  // killed inset sampling and the black shirt leaked through.
  //
  // 8% inset is safe-ish: deep enough to be inside the shirt fabric on
  // a centered product photo, but rarely deep enough to hit a print
  // (most prints are in the middle 40-60% of the photo). For products
  // where the print extends to 84% of the photo width, this MAY nibble
  // print edges — those need a manual remove.bg pass on the cleanDesign.
  const ix = Math.floor(w * 0.08)
  const iy = Math.floor(h * 0.08)
  const samples: Array<[number, number, number]> = [
    // Perimeter (8)
    px(0, 0), px(w - 1, 0), px(0, h - 1), px(w - 1, h - 1),
    px(Math.floor(w / 2), 0), px(Math.floor(w / 2), h - 1),
    px(0, Math.floor(h / 2)), px(w - 1, Math.floor(h / 2)),
    // Insets — corners and edge midpoints (8)
    px(ix, iy), px(w - 1 - ix, iy),
    px(ix, h - 1 - iy), px(w - 1 - ix, h - 1 - iy),
    px(Math.floor(w / 2), iy), px(Math.floor(w / 2), h - 1 - iy),
    px(ix, Math.floor(h / 2)), px(w - 1 - ix, Math.floor(h / 2)),
  ]
  const TOL = 75 // slightly looser to handle JPEG compression noise
  for (let i = 0; i < out.length; i += 4) {
    const r = out[i], g = out[i + 1], b = out[i + 2]
    let minDist = Infinity
    for (const [sr, sg, sb] of samples) {
      const d = Math.sqrt((r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2)
      if (d < minDist) minDist = d
      if (d < TOL) break // early exit
    }
    if (minDist < TOL) {
      out[i + 3] = 0
    } else if (minDist < TOL * 1.5) {
      // Soft edge — fade out gradually for a less hard-cut look
      out[i + 3] = Math.round(255 * ((minDist - TOL) / (TOL * 0.5)))
    }
  }
  return sharp(out, {
    raw: { width: w, height: h, channels: 4 },
  }).png().toBuffer()
}

/** Auto-crop transparent borders from a buffer. Returns the trimmed buffer. */
async function trimTransparent(input: Buffer): Promise<Buffer> {
  // sharp's .trim() handles this — trims based on top-left pixel by
  // default; with alpha input it trims transparent borders.
  return sharp(input).trim().png().toBuffer()
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string; frame: string }> },
) {
  try {
    const { productId, frame: frameRaw } = await params
    const frameIdx = parseInt(frameRaw.replace(/\.png$/i, ''), 10)
    if (isNaN(frameIdx) || frameIdx < 0 || frameIdx >= FRAME_COUNT) {
      return new NextResponse('frame out of range', { status: 404 })
    }

    // Load the base rotation frame
    const framePath = join(
      process.cwd(),
      'public',
      'lifestyle',
      'rotation',
      `frame-${String(frameIdx).padStart(2, '0')}.webp`,
    )
    const baseFrame = await readFile(framePath)
    const spec = FRAME_SPECS[frameIdx]

    // If the design isn't visible on this frame OR product has no design,
    // return the bare frame unchanged.
    if (!spec.visible) {
      return new NextResponse(new Uint8Array(baseFrame), {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }

    const designUrl = await getProductDesignUrl(productId)
    if (!designUrl) {
      return new NextResponse(new Uint8Array(baseFrame), {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=300', // short — design may land later
        },
      })
    }

    // Fetch the design PNG/JPG
    const designRes = await fetch(designUrl)
    if (!designRes.ok) {
      return new NextResponse(new Uint8Array(baseFrame), {
        headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=300' },
      })
    }
    const designBuf = Buffer.from(await designRes.arrayBuffer())

    // Process the design: chroma-key out white background, then trim
    let designProcessed: Buffer
    try {
      const keyed = await chromaKeyToTransparent(designBuf)
      designProcessed = await trimTransparent(keyed)
    } catch (e) {
      // If chroma-key fails (e.g. design already perfectly transparent),
      // fall back to the original
      designProcessed = designBuf
    }

    // Resize the design to chest dimensions. Width comes from FRAME_SPECS,
    // height auto-scales. Apply scaleX for ¾-angle compression.
    const targetW = Math.round(FRAME_WIDTH * spec.width * (spec.scaleX ?? 1))
    const designMeta = await sharp(designProcessed).metadata()
    const aspect = (designMeta.width || 1) / (designMeta.height || 1)
    const targetH = Math.round(targetW / aspect)
    const designResized = await sharp(designProcessed)
      .resize(targetW, targetH, { fit: 'inside', withoutEnlargement: false })
      .toBuffer()

    // Composite onto the base frame at the chest position. sharp's composite
    // takes top-left coords, so we shift from chest center.
    const left = Math.round(FRAME_WIDTH * spec.cx - targetW / 2)
    const top = Math.round(FRAME_HEIGHT * spec.cy - targetH / 2)
    const composited = await sharp(baseFrame)
      .composite([{ input: designResized, left, top }])
      .webp({ quality: 88 })
      .toBuffer()

    return new NextResponse(new Uint8Array(composited), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    console.error('[/api/mockup] failed:', err)
    return new NextResponse('mockup render failed', { status: 500 })
  }
}
