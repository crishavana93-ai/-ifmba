'use client'
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
                    <div className="shop-photo-empty">
                      {lang === 'en' ? 'Photo coming' : 'Bild laddas upp'}
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
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
