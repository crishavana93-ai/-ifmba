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
          padding: 72,
          backgroundColor: '#FFCB05',
          backgroundImage:
            'linear-gradient(135deg, #FFCB05 0%, #FFCB05 45%, #4AB5DE 45%, #4AB5DE 72%, #1D7AA0 72%, #1D7AA0 100%)',
          color: '#0b1220',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: '#0b1220',
              display: 'flex',
            }}
          />
          <div style={{ display: 'flex' }}>Säsong 2025/26 · Div 3 Skåne</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 340,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -14,
              color: '#0b1220',
            }}
          >
            MBA
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 40,
              fontWeight: 600,
              marginTop: 20,
              color: '#0b1220',
              maxWidth: 940,
            }}
          >
            Malmös internationella basketfamilj — 9 nationer, 1 tröja.
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
          <div style={{ display: 'flex' }}>ifmba.se</div>
          <div style={{ display: 'flex' }}>#1 i tabellen · 5–0</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
