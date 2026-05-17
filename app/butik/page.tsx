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

export const revalidate = 60

export const metadata: Metadata = {
  title: 'MBA Shop — Klubbmärke & Fan Drop · Malmö Basket',
  description:
    'Officiell MBA-utrustning + handplockad Fan Drop. Tröjor, kepsar, t-shirts och accessoarer. Designad i Malmö, levererad från EU.',
  alternates: { canonical: '/butik' },
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
            {fanDrop.length > 0 && (
              <ScrollReveal>
                <ShopGrid
                  products={fanDrop}
                  eyebrow="Fan Drop"
                  title="Streetball <em>energy</em>"
                  body="Handplockad streetwear som matchar MBA-paletten. Frakt från EU-lager på 3–7 dagar."
                  num="02"
                  numText="FAN DROP"
                  className="section-alt"
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
