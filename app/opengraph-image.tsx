import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'MBA — Malmö Basket'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background:
            'linear-gradient(135deg,#FFCB05 0%,#FFCB05 40%,#4AB5DE 40%,#4AB5DE 70%,#1D7AA0 70%,#1D7AA0 100%)',
          color: '#0b1220',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: '#0b1220',
            }}
          />
          <span>Säsong 2025/26 · Div 3 Skåne</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div
            style={{
              fontSize: 360,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: -18,
              color: '#0b1220',
            }}
          >
            MBA
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 600,
              marginTop: 16,
              color: '#0b1220',
              maxWidth: 900,
            }}
          >
            Malmös internationella basketfamilj.
            <br />9 nationer. 1 tröja.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: '#0b1220',
          }}
        >
          <span>ifmba.se</span>
          <span>#1 i tabellen · 5–0</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
