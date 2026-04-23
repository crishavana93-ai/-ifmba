/**
 * MBA Crest — inline SVG.
 * Blue inner disc with golden rays, basketball top, "MBA" banner bottom.
 * Scales via `size` prop; recolors via CSS props if needed.
 */
export default function Crest({ size = 120, className = '' }: { size?: number; className?: string }) {
  const rays = Array.from({ length: 16 }, (_, i) => i * (360 / 16))

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      aria-label="MBA crest"
      role="img"
    >
      {/* Outer gold ring */}
      <circle cx="100" cy="100" r="96" fill="#FFCB05" />
      {/* Inner navy border */}
      <circle cx="100" cy="100" r="86" fill="#0B1220" />
      {/* Sky disc */}
      <circle cx="100" cy="100" r="78" fill="#4AB5DE" />

      {/* Sun rays */}
      <g transform="translate(100,100)">
        {rays.map((deg) => (
          <rect
            key={deg}
            x="-3"
            y="-78"
            width="6"
            height="16"
            fill="#FFCB05"
            transform={`rotate(${deg})`}
            rx="1.5"
          />
        ))}
      </g>

      {/* Basketball */}
      <g transform="translate(100,78)">
        <circle cx="0" cy="0" r="26" fill="#FFCB05" stroke="#0B1220" strokeWidth="2.5" />
        <line x1="-26" y1="0" x2="26" y2="0" stroke="#0B1220" strokeWidth="2" />
        <path d="M 0,-26 Q 12,0 0,26" fill="none" stroke="#0B1220" strokeWidth="2" />
        <path d="M 0,-26 Q -12,0 0,26" fill="none" stroke="#0B1220" strokeWidth="2" />
      </g>

      {/* MBA banner */}
      <g>
        <rect x="32" y="118" width="136" height="36" fill="#0B1220" stroke="#FFCB05" strokeWidth="2.5" />
        <text
          x="100"
          y="143"
          textAnchor="middle"
          fill="#FFCB05"
          fontFamily="Inter Tight, system-ui, sans-serif"
          fontSize="22"
          fontWeight="900"
          letterSpacing="4"
        >
          MBA
        </text>
      </g>
    </svg>
  )
}
