/**
 * /butik — MBA Shop catalog page.
 *
 * Renders all in-stock `dropshipProduct` documents as a grid. Each card
 * shows photo + name + price (compare-at if set) + ship-from indicator +
 * an "Add to cart" CTA that currently mailto:s Cris with the order intent
 * (Phase 1 manual fulfillment). When Shopify is wired up later, the CTA
 * becomes a real add-to-cart / Buy Now.
 *
 * Three product groups visually: MBA Official (Printful/Printify/direct
 * sourceType), Fan Drop (AliExpress), and Inventory (held in club). Each
 * gets its own section so customers understand the difference.
 */
import type { Metadata } from 'next'
import { safeFetch, QUERIES } from '@/lib/sanity'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollProgress from '@/components/ScrollProgress'
import ScrollReveal from '@/components/ScrollReveal'
import BackToTop from '@/components/BackToTop'
import ShopGrid from '@/components/ShopGrid'
// Showroom now uses real-photo rotation instead of 3D — small bundle, can
// import directly without the lazy wrapper. Showroom3DLazy.tsx still exists
// in case we ever bring back the Three.js viewer.
import Showroom from '@/components/Showroom3D'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'MBA Shop — Klubbmärke & Fan Drop · Malmö Basket',
  description:
    'Officiell MBA-utrustning + handplockad Fan Drop. Tröjor, kepsar, t-shirts och accessoarer. Designad i Malmö, levererad från EU.',
  alternates: { canonical: '/butik' },
  openGraph: {
    title: 'MBA Shop — Klubbmärke & Fan Drop · Malmö Basket',
    description: 'Officiell MBA-utrustning + handplockad Fan Drop. Tröjor, kepsar, t-shirts och accessoarer. Designad i Malmö, levererad från EU.',
    url: '/butik',
    siteName: 'MBA — Malmö Basket',
    locale: 'sv_SE',
    type: 'website',
  },
}

export default async function ButikPage() {
  const [settings, courts, products] = await Promise.all([
    safeFetch<any>(QUERIES.settings, null),
    safeFetch<any[]>(QUERIES.courts, []),
    safeFetch<any[]>(QUERIES.shopProducts, []),
  ])

  // Group products by source type so the page reads as: Official → Fan Drop → Inventory.
  const mbaOfficial = products.filter((p) =>
    ['printful', 'printify', 'direct', 'inventory'].includes(p.sourceType),
  )
  const fanDrop = products.filter((p) => p.sourceType === 'aliexpress')

  return (
    <>
      {/* Product structured data — lets Google show shop items as rich
          results. Only in-stock products with a price are listed. */}
      {products.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: products
                .filter((p) => typeof p.priceSek === 'number' && p.name)
                .slice(0, 20)
                .map((p, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  item: {
                    '@type': 'Product',
                    name: p.name,
                    image: p.imageUrl ? `${p.imageUrl}?w=800&auto=format` : undefined,
                    url: `https://www.ifmba.se/butik${p.slug ? `#${p.slug}` : ''}`,
                    brand: { '@type': 'Brand', name: 'MBA — Malmö Basket' },
                    offers: {
                      '@type': 'Offer',
                      price: p.priceSek,
                      priceCurrency: 'SEK',
                      availability: 'https://schema.org/InStock',
                    },
                  },
                })),
            }),
          }}
        />
      )}
      <ScrollProgress />
      <BackToTop />
      <Navbar />

      <main id="main" style={{ paddingTop: 'clamp(48px, 8vw, 96px)' }}>
        {/* Hero block — sets the brand tone for the shop, regardless of catalog state. */}
        <section className="section section-dark">
          <div className="contain" style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto' }}>
            <div className="label">MBA Shop</div>
            <h1 className="title" style={{ margin: '0 auto', maxWidth: 720 }}>
              Bär <em>familjen</em>.
            </h1>
            <p style={{ marginTop: 16, opacity: 0.85, fontSize: 'clamp(15px,1.2vw,17px)', lineHeight: 1.6 }}>
              Officiell MBA-utrustning + handplockad streetwear för fans. Varje köp finansierar
              klubben — tröjor, hallhyra, resor.
            </p>
            <div style={{ marginTop: 16, fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.7 }}>
              {products.length === 0
                ? 'Lansering snart · Var först · Följ @ifmba_basket'
                : `${products.length} produkter · 🇪🇺 fraktas från EU-lager`}
            </div>
          </div>
        </section>

        {products.length === 0 ? (
          <section className="section section-alt">
            <div className="contain" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
              <h2 className="title" style={{ fontSize: 'clamp(24px,3vw,36px)' }}>
                Produkterna laddas <em>upp denna vecka</em>
              </h2>
              <p style={{ marginTop: 12, opacity: 0.85 }}>
                Cris lägger upp den första kollektionen via Sanity Studio.
                Tröjsetet (custom MBA-design) öppnar för förbeställning så snart
                provet är godkänt — håll utkik.
              </p>
            </div>
          </section>
        ) : (
          <>
            {/* SINGLE SECTION — Showroom is now the entire shop UX:
                  - Click any thumbnail → model swaps to wearing that shirt's video
                  - Click "Reservera →" → opens the reservation modal inline
                The legacy Fan Drop ShopGrid was redundant (same products in a
                less interactive layout) and was removed 2026-05-19 per Cris.
                MBA Official kept as a separate section IF any official-source
                products exist — they have a different filming spec and ship
                from a different warehouse. */}
            {fanDrop.some((p) => p.category === 'apparel-tee') && (
              <Showroom
                products={fanDrop}
                num="00"
                numText="LIVE"
                className="section-alt"
              />
            )}

            {mbaOfficial.length > 0 && (
              <ScrollReveal>
                <ShopGrid
                  products={mbaOfficial}
                  eyebrow="MBA Official"
                  title="Klubbmärke <em>på tröjan</em>"
                  body="Officiell MBA-utrustning. Designad i Malmö, producerad i EU. 100 % av vinsten går tillbaka till klubben."
                  num="01"
                  numText="OFFICIAL"
                  className="section-dark"
                />
              </ScrollReveal>
            )}
          </>
        )}
      </main>

      <Footer settings={settings} courts={courts} />
    </>
  )
}
