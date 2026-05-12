/**
 * Apparel — 8 merch cards driven by drop-shipping (Printful / Printify model,
 * same playbook Nikos uses for Ballers).
 *
 * Three game jerseys (Home / Away / Exhibition) + four casual lines
 * (T-shirt, Hoodie, Cap — "Lanre's cap", Fan Collection accessories).
 *
 * Product images come from Sanity `mediaAsset` documents, keyed by `placement`:
 *   merch-home-jersey       → Home Jersey (blue & gold)
 *   merch-away-jersey       → Away Jersey (yellow & blue)
 *   merch-exhibition-jersey → Exhibition / Throwback jersey
 *   merch-tee               → "9 Nations" T-shirt
 *   merch-hoodie            → MBA hoodie
 *   merch-cap               → "Lanre's cap" snapback
 *   merch-casual            → Casual Run training piece
 *   merch-fans              → Fan Collection (scarves, totes, stickers)
 *
 * If no image is published yet, an empty-state placeholder renders in its slot
 * so the grid still looks intentional and the editor can see where to drop art.
 *
 * Each card carries a `cta` linking out to the storefront (Printful storefront,
 * Shopify, etc.). Until a storefront is live, the link is a placeholder that
 * routes to /anslut so the click still goes somewhere useful.
 *
 * Expects `media` = full list from QUERIES.mediaAll, filtered client-side to
 * avoid 8 separate GROQ round-trips.
 */

type MediaRow = {
  _id: string
  kind: 'photo' | 'video'
  category?: string
  placement?: string
  title?: string
  captionSv?: string
  captionEn?: string
  imageUrl?: string | null
}

type Card = {
  slot: string
  name: string
  sub: string
  price: string
  tag?: string
}

const CARDS: Card[] = [
  // ── Game jerseys ───────────────────────────────────────────────
  { slot: 'merch-home-jersey',       name: 'Home Jersey · Blue & Gold',  sub: 'Match · Primary 2026',    price: '549 kr', tag: 'NEW' },
  { slot: 'merch-away-jersey',       name: 'Away Jersey · Yellow & Blue', sub: 'Match · Alternate 2026',  price: '549 kr' },
  { slot: 'merch-exhibition-jersey', name: 'Exhibition Jersey',           sub: '9 Nations · Limited',     price: '649 kr', tag: 'LIMITED' },
  // ── Casual / drop-ship ────────────────────────────────────────
  { slot: 'merch-tee',     name: '9 Nations Tee',     sub: 'Cotton · Unisex',          price: '249 kr' },
  { slot: 'merch-hoodie',  name: 'MBA Hoodie',         sub: 'Heavyweight · Embroidered', price: '599 kr' },
  { slot: 'merch-cap',     name: "Lanre's Cap",        sub: 'Snapback · Coach-edition',  price: '329 kr', tag: 'COACH PICK' },
  { slot: 'merch-casual',  name: 'Casual Run',         sub: 'Training / Off-court',     price: '399 kr' },
  { slot: 'merch-fans',    name: 'Fan Collection',     sub: 'Scarves · Totes · Sticker', price: '279 kr' },
]

export default function Apparel({
  media = [],
  num,
  numText,
  className,
}: {
  media?: MediaRow[]
  num?: string
  numText?: string
  className?: string
}) {
  // 1) Prefer assets that have an explicit placement like 'merch-blue-gold'.
  const byPlacement = new Map<string, MediaRow>()
  for (const m of media) {
    if (m.placement && !byPlacement.has(m.placement)) byPlacement.set(m.placement, m)
  }
  // 2) Any merch-category photos without a placement become fallback fillers,
  //    so uploading 4 photos without fiddling with the placement dropdown
  //    still populates the 4 cards in order.
  const fallbackPool: MediaRow[] = media.filter(
    (m) =>
      m.kind === 'photo' &&
      m.imageUrl &&
      m.category === 'merch' &&
      (!m.placement || !byPlacement.has(m.placement) || byPlacement.get(m.placement) !== m),
  )
  const fallbackUnused = fallbackPool.filter(
    (m) => !Array.from(byPlacement.values()).some((v) => v._id === m._id),
  )
  let fallbackIdx = 0

  return (
    <section
      className={`apparel section ${className || ''}`.trim()}
      data-num={num}
      data-num-text={numText}
      id="apparel"
    >
      <div className="contain">
        <div className="label r">Merch</div>
        <h2 className="title r">
          Bär <em>familjen</em>
        </h2>

        <div className="ap-grid">
          {CARDS.map((card, i) => {
            let asset = byPlacement.get(card.slot)
            if (!asset && fallbackIdx < fallbackUnused.length) {
              asset = fallbackUnused[fallbackIdx++]
            }
            const img = asset?.imageUrl
            return (
              <article
                key={card.slot}
                className="ap-card r"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="ap-photo">
                  {card.tag && <span className="ap-tag">{card.tag}</span>}
                  {img ? (
                    <img
                      src={img}
                      alt={asset?.captionEn || asset?.title || card.name}
                    />
                  ) : (
                    <div className="ap-photo-empty">Photo pending</div>
                  )}
                </div>
                <div className="ap-meta">
                  <div className="ap-sub">{card.sub}</div>
                  <div className="ap-name">{card.name}</div>
                  <div className="ap-price">{card.price}</div>
                  <a
                    className="ap-cta"
                    href="/anslut"
                    aria-label={`Shop ${card.name}`}
                  >
                    Shop →
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
