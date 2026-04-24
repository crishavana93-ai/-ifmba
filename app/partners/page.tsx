/**
 * /partners — dedicated sponsor / partnership page.
 *
 * Fuller pitch + full tier breakdown + all published Sponsor documents grouped
 * by tier. Links from the homepage "PARTNERS" section + Footer point here.
 */
import Link from 'next/link'
import type { Metadata } from 'next'
import { safeFetch, QUERIES, urlFor } from '@/lib/sanity'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollProgress from '@/components/ScrollProgress'
import BackToTop from '@/components/BackToTop'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Partners — MBA · Malmö Basket',
  description:
    'Bli partner med Malmös mest internationella basketlag. Paket från Bronze till Platinum — exponering, gemenskap, och mätbar räckvidd i Skåne.',
  alternates: { canonical: '/partners' },
}

type Tier = {
  key: 'Platinum' | 'Gold' | 'Silver' | 'Bronze'
  nameSv: string
  price: string
  benefits: string[]
  pitch: string
}

const TIERS: Tier[] = [
  {
    key: 'Platinum',
    nameSv: 'Platinum',
    price: '25 000 kr',
    pitch: 'Titelpartner. Ni blir del av berättelsen.',
    benefits: [
      'Logo på matchtröjans framsida (största placeringen)',
      'Huvudplacering på ifmba.se — hero + sidfot',
      'Branding på allt matchinnehåll + klipp',
      '10 VIP-matchbiljetter per säsong',
      'Kvartalsvisa feature-inlägg på MBA Instagram',
      'Företagsträning med laget — 1× per år',
      'Logo på uppvärmningströjor + bänksidor',
    ],
  },
  {
    key: 'Gold',
    nameSv: 'Guld',
    price: '15 000 kr',
    pitch: 'Featured partner. Tydlig exponering i hela säsongen.',
    benefits: [
      'Logo på matchtröjans baksida',
      'Featured-placering på webben',
      'LED/banner på hemmamatcher',
      '6 matchbiljetter per säsong',
      'Sociala media-omnämnanden',
      'Co-branded inlägg — 4× per år',
    ],
  },
  {
    key: 'Silver',
    nameSv: 'Silver',
    price: '8 000 kr',
    pitch: 'Supporting partner. Bra första steg in i samarbetet.',
    benefits: [
      'Logo på uppvärmningströjor',
      'Listad på sponsorsidan',
      '4 matchbiljetter per säsong',
      'Co-branded inlägg — 2× per år',
    ],
  },
  {
    key: 'Bronze',
    nameSv: 'Brons',
    price: '3 000 kr',
    pitch: 'Community partner. För lokala företag som tror på laget.',
    benefits: [
      'Logo i sponsorsektionen',
      'Nämnd i nyhetsbrevet',
      '2 matchbiljetter per säsong',
    ],
  },
]

export default async function PartnersPage() {
  const [sponsors, settings] = await Promise.all([
    safeFetch<any[]>(QUERIES.sponsors, []),
    safeFetch<any>(QUERIES.settings, null),
  ])

  const byTier = (tier: string) => sponsors.filter((s: any) => s.tier === tier)

  return (
    <>
      <ScrollProgress />
      <BackToTop />
      <Navbar />

      <main className="page-hero section section-dark">
        <div className="contain">
          <div className="label r v">Partners</div>
          <h1 className="title r v" style={{ marginBottom: '18px' }}>
            Bli en del av <em>familjen</em>
          </h1>
          <p className="page-lede r v">
            MBA är <strong>Malmös mest internationella basketlag</strong> — 9 nationer,
            1 tröja, och nyuppflyttade till Div 2 Skåne Herr. Vi söker partners som
            delar värderingarna: gemenskap, disciplin och kärleken till spelet.
          </p>
          <div className="page-hero-cta r v">
            <a
              className="btn-cta"
              href="mailto:mba.malmo.basket@gmail.com?subject=MBA%20Partnership%20Inquiry"
            >
              Kontakta oss
            </a>
            <a
              className="btn-cta btn-cta-ghost"
              href="#tiers"
            >
              Se paket →
            </a>
          </div>
        </div>
      </main>

      {/* Why partner with MBA */}
      <section className="section section-alt">
        <div className="contain">
          <div className="label r v">Varför MBA</div>
          <h2 className="title r v" style={{ marginBottom: '32px' }}>
            Räckvidd + <em>berättelse</em>
          </h2>
          <div className="partners-why">
            <div className="partners-why-item r v">
              <div className="partners-why-num">9</div>
              <div className="partners-why-lbl">Nationer</div>
              <p>
                Publiken sträcker sig från Malmö till Atén, Lagos, Manila och Mexiko
                City. Autentisk internationell räckvidd i en Skånsk klubb.
              </p>
            </div>
            <div className="partners-why-item r v">
              <div className="partners-why-num">Div 2</div>
              <div className="partners-why-lbl">Nyuppflyttade</div>
              <p>
                Vi går in i 2025/26 efter obesegrad säsong. Ni syns när laget är på
                uppgång — maximal mediauppmärksamhet.
              </p>
            </div>
            <div className="partners-why-item r v">
              <div className="partners-why-num">1</div>
              <div className="partners-why-lbl">Tröja</div>
              <p>
                En visuell identitet byggd för att synas på LED-banners, sociala
                medier och matchtröjor. Ni blir del av den.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="section section-dark" id="tiers">
        <div className="contain">
          <div className="label r v">Paket</div>
          <h2 className="title r v" style={{ marginBottom: '32px' }}>
            Fyra <em>nivåer</em>
          </h2>

          <div className="tiers" style={{ marginTop: 'clamp(24px,3vw,40px)' }}>
            {TIERS.map((tier) => {
              const taken = byTier(tier.key)
              const isAvailable = taken.length === 0
              return (
                <div key={tier.key} className={`tier tier-${tier.key.toLowerCase()} r v`}>
                  <div className="tier-name">{tier.nameSv}</div>
                  <div className="tier-price">
                    {tier.price}
                    <small>/ säsong</small>
                  </div>
                  <p className="tier-pitch">{tier.pitch}</p>
                  <ul className="tier-benefits">
                    {tier.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                  {!isAvailable && (
                    <div className="tier-partners">
                      <div className="tier-partners-lbl">Aktuella partners:</div>
                      {taken.map((s: any) => (
                        <a
                          key={s._id}
                          className="tier-partner-chip"
                          href={s.website || '#'}
                          target="_blank"
                          rel="noopener"
                        >
                          {s.logo && (
                            <img
                              src={urlFor(s.logo).width(80).height(40).fit('max').url()}
                              alt={s.name}
                            />
                          )}
                          <span>{s.name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                  {isAvailable && (
                    <div className="tier-availability">Platser tillgängliga</div>
                  )}
                  <a
                    className="tier-cta"
                    href={`mailto:mba.malmo.basket@gmail.com?subject=MBA%20${tier.key}%20Partnership`}
                  >
                    Boka samtal
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* All current partners wall (if any published) */}
      {sponsors.length > 0 && (
        <section className="section section-alt">
          <div className="contain">
            <div className="label r v">Tack till</div>
            <h2 className="title r v" style={{ marginBottom: '32px' }}>
              Våra <em>partners</em>
            </h2>
            <div className="partners-wall r v">
              {sponsors.map((s: any) => (
                <a
                  key={s._id}
                  className="partner-wall-card"
                  href={s.website || '#'}
                  target="_blank"
                  rel="noopener"
                >
                  {s.logo && (
                    <img
                      src={urlFor(s.logo).width(200).height(100).fit('max').url()}
                      alt={s.name}
                    />
                  )}
                  <div className="partner-wall-name">{s.name}</div>
                  <div className="partner-wall-tier">{s.tier}</div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="section section-dark">
        <div className="contain" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <h2 className="title r v" style={{ marginBottom: '18px' }}>
            Redo att bli <em>synlig</em>?
          </h2>
          <p className="page-lede r v" style={{ marginBottom: '28px' }}>
            Vi skräddarsyr paket efter era mål. Kontakta oss — vi återkommer inom 48
            timmar med en prospect deck och ett öppet samtal.
          </p>
          <a
            className="btn-cta"
            href="mailto:mba.malmo.basket@gmail.com?subject=MBA%20Partnership%20Inquiry"
          >
            Kontakta oss
          </a>
          <div style={{ marginTop: '18px' }}>
            <Link href="/" className="partners-back-link">
              ← Tillbaka till startsidan
            </Link>
          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </>
  )
}
