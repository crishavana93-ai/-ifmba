/**
 * Apparel — 4 merch cards (Match, Alt, Casual Run, Fan gear).
 *
 * Product images come from Sanity `mediaAsset` documents, keyed by `placement`:
 *   merch-blue-gold  → Match Kit (primary)
 *   merch-yellow-blue → Alt Kit
 *   merch-casual     → Casual Run
 *   merch-fans       → Fan Collection
 *
 * If no image is published yet, an empty-state placeholder renders in its slot
 * so the grid still looks intentional and the editor can see where to drop art.
 *
 * Expects `media` = full list from QUERIES.mediaAll, filtered client-side to
 * avoid 4 separate GROQ round-trips.
 */

type MediaRow = {
  _id: string
  kind: 'photo' | 'video'
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
}

const CARDS: Card[] = [
  { slot: 'merch-blue-gold', name: 'Match Kit · Blue & Gold', sub: 'Primary 2026', price: '549 kr' },
  { slot: 'merch-yellow-blue', name: 'Alt Kit · Yellow & Blue', sub: 'Alternate 2026', price: '549 kr' },
  { slot: 'merch-casual', name: 'Casual Run', sub: 'Training / Off-court', price: '399 kr' },
  { slot: 'merch-fans', name: 'Fan Collection', sub: 'Supporter gear', price: '279 kr' },
]

export default function Apparel({ media = [], num, numText, className }: { media?: MediaRow[]; num?: string; numText?: string; className?: string }) {
  const byPlacement = new Map<string, MediaRow>()
  for (const m of media) {
    if (m.placement && !byPlacement.has(m.placement)) byPlacement.set(m.placement, m)
  }

  return (
    <section className={`apparel section ${className || ''}`.trim()} data-num={num} data-num-text={numText} id="apparel">
      <div className="contain">
        <div className="label r">Merch</div>
        <h2 className="title r">
          Bär <em>familjen</em>
        </h2>

        <div className="ap-grid">
          {CARDS.map((card, i) => {
            const asset = byPlacement.get(card.slot)
            const img = asset?.imageUrl
            return (
              <article
                key={card.slot}
                className="ap-card r"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="ap-photo">
                  {img ? (
                    <img src={img} alt={asset?.captionEn || asset?.title || card.name} />
                  ) : (
                    <div className="ap-photo-empty">Photo pending</div>
                  )}
                </div>
                <div className="ap-meta">
                  <div className="ap-sub">{card.sub}</div>
                  <div className="ap-name">{card.name}</div>
                  <div className="ap-price">{card.price}</div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
