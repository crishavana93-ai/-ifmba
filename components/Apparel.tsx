/**
 * Apparel — homepage merch teaser.
 *
 * Driven by the SAME data as the /butik shop: renders the real
 * `dropshipProduct` documents (QUERIES.shopProducts) so the landing page always
 * matches what's actually for sale. Each card links to /butik#<slug>.
 * Falls back to legacy media cards only if the shop has no products yet.
 * Perf (2026-08-01): images render as ~640px CDN thumbnails, lazy-loaded.
 */

import { thumb } from '@/lib/sanity'

type Product = {
  _id: string
  name: string
  slug?: string
  category?: string
  shipsFrom?: string
  priceSek?: number
  compareAtPriceSek?: number
  imageUrl?: string | null
  cleanDesignUrl?: string | null
  tag?: string
}

type MediaRow = {
  _id: string
  kind?: 'photo' | 'video'
  category?: string
  placement?: string
  title?: string
  captionEn?: string
  imageUrl?: string | null
}

const FALLBACK_CARDS = [
  { slot: 'merch-home-jersey', name: 'Home Jersey · Blue & Gold', sub: 'Match · Primary 2026', price: '549 kr', tag: 'NEW' },
  { slot: 'merch-away-jersey', name: 'Away Jersey · Yellow & Blue', sub: 'Match · Alternate 2026', price: '549 kr' },
  { slot: 'merch-exhibition-jersey', name: 'Exhibition Jersey', sub: '15 Nations · Limited', price: '649 kr', tag: 'LIMITED' },
  { slot: 'merch-tee', name: '15 Nations Tee', sub: 'Cotton · Unisex', price: '249 kr' },
]

export default function Apparel({
  products = [],
  media = [],
  num,
  numText,
  className,
}: {
  products?: Product[]
  media?: MediaRow[]
  num?: string
  numText?: string
  className?: string
}) {
  const realProducts = (products || []).filter((p) => p && p.name).slice(0, 8)
  const useReal = realProducts.length > 0

  const byPlacement = new Map<string, MediaRow>()
  for (const m of media) if (m.placement && !byPlacement.has(m.placement)) byPlacement.set(m.placement, m)

  return (
    <section className={`apparel section ${className || ''}`.trim()} data-num={num} data-num-text={numText} id="apparel">
      <div className="contain">
        <div className="label r">Merch</div>
        <h2 className="title r">Bär <em>familjen</em></h2>

        <div className="ap-grid">
          {useReal
            ? realProducts.map((p, i) => {
                const img = p.imageUrl || p.cleanDesignUrl
                const sub = p.category || p.shipsFrom || 'MBA Shop'
                return (
                  <article key={p._id} className="ap-card r" style={{ transitionDelay: `${i * 60}ms` }}>
                    <div className="ap-photo">
                      {p.tag && <span className="ap-tag">{p.tag}</span>}
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb(img, 640)} alt={p.name} loading="lazy" decoding="async" />
                      ) : (
                        <div className="ap-photo-empty">Photo pending</div>
                      )}
                    </div>
                    <div className="ap-meta">
                      <div className="ap-sub">{sub}</div>
                      <div className="ap-name">{p.name}</div>
                      <div className="ap-price">
                        {p.compareAtPriceSek ? <s style={{ opacity: 0.55, marginRight: 8 }}>{p.compareAtPriceSek} kr</s> : null}
                        {typeof p.priceSek === 'number' ? `${p.priceSek} kr` : ''}
                      </div>
                      <a className="ap-cta" href={p.slug ? `/butik#${p.slug}` : '/butik'} aria-label={`Shop ${p.name}`}>Shop →</a>
                    </div>
                  </article>
                )
              })
            : FALLBACK_CARDS.map((card, i) => {
                const asset = byPlacement.get(card.slot)
                const img = asset?.imageUrl
                return (
                  <article key={card.slot} className="ap-card r" style={{ transitionDelay: `${i * 60}ms` }}>
                    <div className="ap-photo">
                      {card.tag && <span className="ap-tag">{card.tag}</span>}
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb(img, 640)} alt={asset?.captionEn || asset?.title || card.name} loading="lazy" decoding="async" />
                      ) : (
                        <div className="ap-photo-empty">Photo pending</div>
                      )}
                    </div>
                    <div className="ap-meta">
                      <div className="ap-sub">{card.sub}</div>
                      <div className="ap-name">{card.name}</div>
                      <div className="ap-price">{card.price}</div>
                      <a className="ap-cta" href="/butik" aria-label={`Shop ${card.name}`}>Shop →</a>
                    </div>
                  </article>
                )
              })}
        </div>
      </div>
    </section>
  )
}
