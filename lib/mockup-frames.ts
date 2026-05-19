/**
 * Per-frame chest-area metadata for the /butik rotation viewer.
 *
 * The rotation viewer shows the model in 7 angles around 360°. For each
 * angle, we know roughly where the chest is in the frame — that's the
 * area where a printed design would actually appear. This metadata is
 * consumed by the server-side compositor at /api/mockup/[id]/[frame] so
 * we can pre-render a clean PNG per (product × frame) instead of trying
 * to skew a CSS overlay at runtime (which produced visible distortion).
 *
 * Coordinates are FRACTIONS of the frame's 540×1024 portrait dimensions.
 *
 * Calibration approach: I eyeballed these from the rotation frames in
 * /public/lifestyle/rotation/. To fine-tune, open the frame in any image
 * editor, measure where you want the print to sit, and update the values.
 * Re-rendering happens automatically on next request (Vercel cache is
 * keyed by URL, which changes when this file changes via cache-busting
 * commit hash).
 */

export type FrameSpec = {
  /** Whether the design renders on this frame. Side/back views = false. */
  visible: boolean
  /** Chest center as fraction of frame width (0..1). */
  cx: number
  /** Chest center as fraction of frame height (0..1). */
  cy: number
  /** Design width as fraction of frame width. */
  width: number
  /**
   * Optional horizontal compression for ¾ angles — fakes 3D perspective
   * by squishing the design horizontally. 1.0 = no compression (front-on).
   * Real bodies rotated 45° show the chest at ~70% of its frontal width.
   */
  scaleX?: number
}

/**
 * 7 frames, clockwise rotation from front. After A/B testing the ¾-angle
 * compositing, we decided to show the design ONLY on frame 0 (front). The
 * compressed ¾-view design always looked janky — the human eye spots the
 * difference between a real perspective warp and an algorithmic squish.
 * Printful's own mockup tool does the same: each angle is a separate
 * static composite; rotating shows model+blank-shirt on side/back angles
 * and model+design only on the front shot. Less work, more credible.
 *
 *   0 = front (face camera, chest direct) — design VISIBLE
 *   1-6 = ¾ / side / back — design HIDDEN (blank model rotates)
 */
export const FRAME_SPECS: FrameSpec[] = [
  // 0 — front: chest dead center, dropped slightly below the collarbone
  { visible: true, cx: 0.50, cy: 0.45, width: 0.42 },
  // 1-6 — all other angles: design not composited (model shows blank)
  { visible: false, cx: 0, cy: 0, width: 0 },
  { visible: false, cx: 0, cy: 0, width: 0 },
  { visible: false, cx: 0, cy: 0, width: 0 },
  { visible: false, cx: 0, cy: 0, width: 0 },
  { visible: false, cx: 0, cy: 0, width: 0 },
  { visible: false, cx: 0, cy: 0, width: 0 },
]

/** Frame canvas dimensions — must match the WebPs in /public/lifestyle/rotation/ */
export const FRAME_WIDTH = 540
export const FRAME_HEIGHT = 1024
export const FRAME_COUNT = FRAME_SPECS.length
