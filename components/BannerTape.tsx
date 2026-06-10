'use client'

/**
 * BannerTape — the diagonal scrolling "tape" band (betclic "UNDERDOGS" style).
 *
 * A full-width strip tilted a few degrees, with bold uppercase phrases scrolling
 * sideways forever (pure CSS marquee — no JS/GSAP, so it's cheap and always on).
 * Default phrases mix the MBA + Svenska Basket / Skåne story.
 *
 * Usage — drop it between sections in page.tsx, e.g. right after <Marquee />:
 *   <BannerTape />
 *   <BannerTape angle={3} variant="navy" speed={22} />
 *
 * Props:
 *   items   — phrases to repeat (default below)
 *   angle   — tilt in degrees (default -4)
 *   speed   — seconds per loop (lower = faster, default 26)
 *   variant — 'paper' (white tape, navy text) | 'navy' (navy tape, gold text)
 */
export default function BannerTape({
  items = ['MBA', 'SVENSK BASKET', 'MALMÖ BASKET', 'DIV 2 SKÅNE', '15 NATIONER'],
  angle = -4,
  speed = 26,
  variant = 'paper',
}: {
  items?: string[]
  angle?: number
  speed?: number
  variant?: 'paper' | 'navy'
}) {
  const paper = variant === 'paper'
  const bg = paper ? '#F2F4F7' : '#0B1220'
  const fg = paper ? '#0B1220' : '#FFFFFF'
  const accent = '#FFCB05'

  // Duplicate the phrase list so the -50% translate loops seamlessly.
  const seq = [...items, ...items]

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        background: 'transparent',
        margin: '0',
        zIndex: 2,
      }}
    >
      <style>{`
        @keyframes bt-scroll { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }
        @media (prefers-reduced-motion: reduce) { .bt-track { animation: none !important; } }
      `}</style>
      <div
        style={{
          transform: `rotate(${angle}deg) scale(1.08)`,
          background: bg,
          borderTop: `2px solid ${accent}`,
          borderBottom: `2px solid ${accent}`,
          padding: '14px 0',
          width: '108%',
          marginLeft: '-4%',
        }}
      >
        <div
          className="bt-track"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            willChange: 'transform',
            animation: `bt-scroll ${speed}s linear infinite`,
          }}
        >
          {seq.map((t, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'Arial Black, Inter Tight, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(18px, 2.4vw, 34px)',
                  letterSpacing: '0.04em',
                  color: fg,
                  textTransform: 'uppercase',
                  padding: '0 22px',
                }}
              >
                {t}
              </span>
              <span style={{ color: accent, fontSize: 'clamp(14px, 1.8vw, 24px)' }}>✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
