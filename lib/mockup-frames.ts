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
 * 7 frames, clockwise rotation from front:
 *   0 = front (face camera, chest direct)
 *   1 = ¾ right (face turned to viewer's left, chest at ¾)
 *   2 = side right (chest perpendicular — hidden)
 *   3 = ¾ back-right (back to camera — hidden)
 *   4 = full back (hidden)
 *   5 = ¾ back-left (back to camera — hidden)
 *   6 = side left (chest perpendicular other way — hidden)
 */
export const FRAME_SPECS: FrameSpec[] = [
  // 0 — front: chest dead center, dropped slightly below the collarbone
  { visible: true, cx: 0.50, cy: 0.45, width: 0.42 },
  // 1 — ¾ right: chest shifts left as body rotates clockwise; compressed
  { visible: true, cx: 0.46, cy: 0.45, width: 0.30, scaleX: 0.70 },
  // 2 — side right: no chest visible
  { visible: false, cx: 0, cy: 0, width: 0 },
  // 3 — ¾ back-right: back to camera
  { visible: false, cx: 0, cy: 0, width: 0 },
  // 4 — full back
  { visible: false, cx: 0, cy: 0, width: 0 },
  // 5 — ¾ back-left
  { visible: false, cx: 0, cy: 0, width: 0 },
  // 6 — side left
  { visible: false, cx: 0, cy: 0, width: 0 },
]

/** Frame canvas dimensions — must match the WebPs in /public/lifestyle/rotation/ */
export const FRAME_WIDTH = 540
export const FRAME_HEIGHT = 1024
export const FRAME_COUNT = FRAME_SPECS.length
