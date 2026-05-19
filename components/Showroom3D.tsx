'use client'
/**
 * Showroom3D — interactive 3D t-shirt viewer with texture swap.
 *
 * UX:
 *   - Drag the shirt to rotate 360°
 *   - Scroll / pinch to zoom (clamped so you can't fly into the mesh)
 *   - Below the canvas: a row of product thumbnails — click any to swap
 *     the active design on the shirt instantly (no reload)
 *
 * Implementation notes:
 *   - Uses @react-three/fiber + @react-three/drei (one-time install in ~/ifmba)
 *   - The whole module is dynamically imported in /butik so the three.js
 *     bundle (~900KB gzipped) only loads when the user actually scrolls
 *     into the showroom block — keeps the rest of the site fast.
 *   - The shirt mesh is built procedurally from a torus + plane for now.
 *     When we drop a real .glb model into /public/models/tshirt.glb, swap
 *     <ShirtMesh /> for <useGLTF /> from drei — same texture pipeline.
 *
 * Limitations honest disclosure for Cris:
 *   - Product photos from AliExpress are flat-lays (the shirt itself is IN
 *     the photo). When applied as a texture they look "printed-on-shirt"
 *     which is the right vibe but not photorealistic.
 *   - For pro photorealism, generate just-the-graphic extractions via
 *     remove.bg and re-upload. The viewer is then a true "design on shirt".
 */

import { useEffect, useMemo, useState } from 'react'
import RotationViewer from './RotationViewer'
import { ReservationModal } from './ShopGrid'

// 3D mannequin pipeline (Three.js + GLB model) retired 2026-05-18 in favor of
// real-photo rotation. The .glb model in /public/models/tshirt.glb is kept
// on disk in case we ever want to bring back the 3D mode as a toggle, but
// no code currently references it. To restore: see commit `1bfe96b` for the
// full Three.js implementation, or check git history for `Showroom3D.tsx`.

type Product = {
  _id: string
  _updatedAt?: string
  name: string
  imageUrl?: string | null
  cleanDesignUrl?: string | null
  mockupVideoUrl?: string | null
  priceSek: number
  compareAtPriceSek?: number
  descriptionSv?: string
  descriptionEn?: string
  category?: string
}

function fmtSek(n?: number) {
  if (!n && n !== 0) return ''
  return new Intl.NumberFormat('sv-SE').format(n) + ' kr'
}


export default function Showroom3D({
  products,
  num,
  numText,
  className,
}: {
  products: Product[]
  num?: string
  numText?: string
  className?: string
}) {
  // Only show products with imageUrl AND apparel-tee category (other items
  // don't have a flat design to map onto a shirt).
  const usable = useMemo(
    () => products.filter((p) => p.imageUrl && p.category === 'apparel-tee'),
    [products],
  )

  const [active, setActive] = useState<Product | null>(usable[0] || null)
  // Detect language from <html lang> attribute (same approach ShopGrid uses).
  // Defaults to Swedish since the page is /butik.
  const [lang, setLang] = useState<'sv' | 'en'>('sv')
  useEffect(() => {
    const htmlLang = document.documentElement.lang
    if (htmlLang === 'en') setLang('en')
  }, [])
  // Reservation modal — only opens when user clicks RESERVE on the active product.
  const [reserving, setReserving] = useState<Product | null>(null)
  useEffect(() => {
    if (!active && usable.length > 0) setActive(usable[0])
  }, [usable, active])

  if (usable.length === 0) return null

  const desc = active ? (lang === 'en' ? active.descriptionEn : active.descriptionSv) || '' : ''

  return (
    <section
      className={`showroom section ${className || ''}`.trim()}
      data-num={num}
      data-num-text={numText}
      id="showroom"
    >
      <div className="contain">
        <div className="label">MBA Shop</div>
        <h2 className="title">
          Bär <em>plagget</em> innan du köper
        </h2>
        <p className="showroom-body">
          Klicka ett plagg nedan — modellen byter direkt. Klicka <em>Reservera</em> när du hittar din passform.
        </p>

        <div className="showroom-stage">
          <div className="showroom-canvas">
            <RotationViewer product={active} />
          </div>

          {active && (
            <div className="showroom-info">
              <div className="showroom-info-name">{active.name}</div>
              {desc && <p className="showroom-info-desc">{desc}</p>}
              <div className="showroom-info-priceblock">
                <span className="showroom-info-price">{fmtSek(active.priceSek)}</span>
                {!!active.compareAtPriceSek && active.compareAtPriceSek > active.priceSek && (
                  <span className="showroom-info-compare">{fmtSek(active.compareAtPriceSek)}</span>
                )}
              </div>
              <button
                type="button"
                className="showroom-info-cta"
                onClick={() => setReserving(active)}
              >
                {lang === 'en' ? 'Reserve →' : 'Reservera →'}
              </button>
            </div>
          )}
        </div>

        <div className="showroom-thumbs">
          {usable.map((p) => {
            const isActive = active?._id === p._id
            return (
              <button
                key={p._id}
                type="button"
                className={`showroom-thumb${isActive ? ' is-active' : ''}`}
                onClick={() => setActive(p)}
                aria-label={`Visa ${p.name}`}
                aria-pressed={isActive}
              >
                <img src={p.imageUrl!} alt="" loading="lazy" />
                <span className="showroom-thumb-name">{p.name}</span>
              </button>
            )
          })}
        </div>

        <div className="showroom-credit">
          Riktig modell · Video byter när du klickar · Frakt från EU-lager
        </div>
      </div>

      {reserving && (
        <ReservationModal
          product={reserving as any}
          lang={lang}
          onClose={() => setReserving(null)}
        />
      )}
    </section>
  )
}
