'use client'
import { useEffect, useState } from 'react'
/**
 * ShopGrid — renders a section of dropshipProducts as a card grid.
 *
 * Used by /butik to show MBA Official + Fan Drop in separate sections.
 *
 * Each card:
 *   - Photo (Sanity-hosted), with optional "NEW / LIMITED" ribbon
 *   - Name, price (compare-at strikethrough if set)
 *   - Ship-from chip (🇪🇺 / 🇨🇳 / 🇸🇪)
 *   - Reserve CTA → mailto: to Cris with subject pre-filled (Phase 1).
 *     When Shopify is live, swap the CTA to a Stripe checkout link.
 */

import { useLang } from '@/lib/i18n'

type Product = {
  _id: string
  name: string
  slug?: string
  category?: string
  sourceType?: string
  sourceUrl?: string
  sourceCostSek?: number
  priceSek: number
  compareAtPriceSek?: number
  imageUrl?: string | null
  descriptionSv?: string
  descriptionEn?: string
  tag?: string
  shipsFrom?: string
}

const SHIP_LABEL: Record<string, string> = {
  eu: '🇪🇺 EU',
  cn: '🇨🇳 CN',
  se: '🇸🇪 SE',
  us: '🇺🇸 US',
}

function fmtSek(n: number | undefined) {
  if (!n && n !== 0) return ''
  return new Intl.NumberFormat('sv-SE').format(n) + ' kr'
}

/** Calculate margin from source cost + retail. Returns null if either is missing. */
function calcMargin(cost?: number, price?: number): number | null {
  if (!cost || !price || price <= 0) return null
  return Math.round((1 - cost / price) * 100)
}

/** Category → icon glyph mapping for the empty-photo state. */
function categoryGlyph(cat?: string): string {
  switch (cat) {
    case 'apparel-jersey':       return '\u{1F3BD}' // 🎽 running shirt
    case 'apparel-shorts':       return '\u{1FA73}' // 🩳 shorts
    case 'apparel-hoodie':       return '\u{1F455}' // 👕
    case 'apparel-cap':          return '\u{1F9E2}' // 🧢
    case 'apparel-tee':          return '\u{1F455}' // 👕
    case 'accessories-compression': return '\u{1F4AA}' // 💪
    case 'accessories-socks':    return '\u{1F9E6}' // 🧦
    case 'accessories-bags':     return '\u{1F392}' // 🎒
    case 'fan-gear':             return '\u{1F3C0}' // 🏀
    default:                     return '\u{1F3C0}' // 🏀
  }
}

export default function ShopGrid({
  products,
  eyebrow,
  title,
  body,
  num,
  numText,
  className,
}: {
  products: Product[]
  eyebrow: string
  title: string
  body?: string
  num?: string
  numText?: string
  className?: string
}) {
  const { lang } = useLang()

  // Admin view: append `?admin=1` to /butik URL to reveal cost + margin per
  // card (so Cris can scan profitability at a glance without exposing it
  // to customers). Survives navigation via localStorage.
  const [adminMode, setAdminMode] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('admin') === '1') {
      window.localStorage.setItem('mba_shop_admin', '1')
    } else if (params.get('admin') === '0') {
      window.localStorage.removeItem('mba_shop_admin')
    }
    setAdminMode(window.localStorage.getItem('mba_shop_admin') === '1')
  }, [])

  return (
    <section
      className={`shopgrid section ${className || ''}`.trim()}
      data-num={num}
      data-num-text={numText}
    >
      <div className="contain">
        <div className="label">{eyebrow}</div>
        <h2
          className="title"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        {body && <p className="shopgrid-body">{body}</p>}

        <div className="shopgrid-grid">
          {products.map((p) => {
            const desc = (lang === 'en' ? p.descriptionEn : p.descriptionSv) || ''
            const subject =
              lang === 'en'
                ? `Reservation: ${p.name}`
                : `Beställning: ${p.name}`
            const orderBody =
              lang === 'en'
                ? `Hi MBA,\n\nI'd like to reserve:\n\n• ${p.name} — ${fmtSek(p.priceSek)}\n\nMy size: \nShipping address: \n\nThanks!`
                : `Hej MBA,\n\nJag vill reservera:\n\n• ${p.name} — ${fmtSek(p.priceSek)}\n\nMin storlek: \nLeveransadress: \n\nTack!`
            const mailto = `mailto:mba.malmo.basket@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(orderBody)}`

            return (
              <article key={p._id} className="shop-card">
                <div className="shop-photo">
                  {p.tag && <span className="shop-tag">{p.tag}</span>}
                  {p.shipsFrom && SHIP_LABEL[p.shipsFrom] && (
                    <span className="shop-ship">{SHIP_LABEL[p.shipsFrom]}</span>
                  )}
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} loading="lazy" decoding="async" />
                  ) : (
                    // Intentional empty state — category icon + product name,
                    // looks designed rather than broken until the photo lands.
                    <div className="shop-photo-empty">
                      <span className="shop-empty-icon" aria-hidden="true">
                        {categoryGlyph(p.category)}
                      </span>
                      <span className="shop-empty-label">{p.name}</span>
                    </div>
                  )}
                </div>

                <div className="shop-meta">
                  <div className="shop-name">{p.name}</div>
                  {desc && <div className="shop-desc">{desc}</div>}

                  <div className="shop-price-row">
                    <span className="shop-price">{fmtSek(p.priceSek)}</span>
                    {!!p.compareAtPriceSek && p.compareAtPriceSek > p.priceSek && (
                      <span className="shop-compare">{fmtSek(p.compareAtPriceSek)}</span>
                    )}
                  </div>

                  <a className="shop-cta" href={mailto}>
                    {lang === 'en' ? 'Reserve →' : 'Reservera →'}
                  </a>

                  {adminMode && (
                    <AdminInfo product={p} />
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/** Admin-only block visible when ?admin=1 set on /butik. Shows source cost,
 *  retail, margin %, and a link to the supplier page. Never shown to
 *  customers in the default view. */
function AdminInfo({ product: p }: { product: Product }) {
  const margin = calcMargin(p.sourceCostSek, p.priceSek)
  return (
    <div className="shop-admin">
      <div className="shop-admin-row">
        <span>Cost</span>
        <span>{fmtSek(p.sourceCostSek)}</span>
      </div>
      <div className="shop-admin-row">
        <span>Retail</span>
        <span>{fmtSek(p.priceSek)}</span>
      </div>
      <div className="shop-admin-row shop-admin-margin">
        <span>Margin</span>
        <span>{margin !== null ? `${margin}%` : '—'}</span>
      </div>
      {p.sourceUrl && (
        <a
          className="shop-admin-source"
          href={p.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open supplier ↗
        </a>
      )}
    </div>
  )
}
