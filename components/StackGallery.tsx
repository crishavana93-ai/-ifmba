'use client'

/**
 * StackGallery — "cards pile up as you scroll" team-photo section.
 *
 * Uses the reliable CSS position:sticky stacking pattern: each card sticks at a
 * slightly larger top offset than the previous, so as you scroll they stack
 * into a neat pile (and un-stack on the way back up). No GSAP, no empty gaps,
 * cards always fully visible. Works with reduced-motion out of the box.
 *
 * Usage in page.tsx (pass the team photo URLs you fetch from Sanity):
 *   const teamPhotos = (media || [])
 *     .filter((m) => m.category === 'team' && m.imageUrl).map((m) => m.imageUrl)
 *   <StackGallery images={teamPhotos} label="02 · SÄSONGEN I BILDER"
 *                 title="Ögonblick <em>från familjen</em>" />
 */
export default function StackGallery({
  images,
  label = 'GALLERI',
  title = 'Ögonblick <em>från familjen</em>',
}: {
  images: string[]
  label?: string
  title?: string
}) {
  const pics = (images || []).filter(Boolean).slice(0, 8)
  if (!pics.length) return null

  return (
    <section className="section section-dark" style={{ paddingTop: '10vh', paddingBottom: '14vh' }}>
      <div className="contain" style={{ marginBottom: '5vh' }}>
        <div className="label">{label}</div>
        <h2 className="title" style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: title }} />
      </div>

      <div className="contain" style={{ position: 'relative' }}>
        {pics.map((src, i) => (
          <div
            key={i}
            style={{
              position: 'sticky',
              top: `calc(14vh + ${i * 26}px)`,
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '8vh',
              zIndex: i + 1,
            }}
          >
            <div
              style={{
                width: 'min(880px, 86vw)',
                aspectRatio: '16 / 10',
                borderRadius: 18,
                overflow: 'hidden',
                border: '5px solid #fff',
                boxShadow: '0 30px 70px rgba(0,0,0,0.55)',
                transform: `rotate(${(i % 2 ? 1 : -1) * 1.4}deg)`,
                background: '#111',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
