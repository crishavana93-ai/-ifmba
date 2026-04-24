/**
 * /anslut — "Join the club" page.
 *
 * Three player-facing tracks, each with headline, subhead, fee, schedule,
 * and a contact CTA prefilled with the track name. Fee is a uniform 500 kr
 * placeholder for all three until the real pricing lands.
 *
 * This page is separate from /partners (which is the sponsor-facing page).
 *
 * Linked from:
 *   - Navbar "JOIN" button
 *   - Hero "Gå med nu" CTA
 *   - Sponsor Teaser "Se alla paket" button on the homepage
 */
import Link from 'next/link'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollProgress from '@/components/ScrollProgress'
import BackToTop from '@/components/BackToTop'
import { safeFetch, QUERIES } from '@/lib/sanity'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Bli medlem — MBA · Malmö Basket',
  description:
    'Tre vägar in i MBA: U-10 för barn, Casual Games för vuxna, och Herrlaget i Div 2 Skåne 2026/27. Medlemskap från 500 kr.',
  alternates: { canonical: '/anslut' },
}

type Track = {
  key: 'u10' | 'casual' | 'div2'
  badge: string
  name: string
  headline: string
  subhead: string
  bullets: string[]
  fee: string
  feeUnit: string
  schedule: string
  audience: string
  mailtoSubject: string
  accent: 'sky' | 'yellow' | 'navy'
}

const TRACKS: Track[] = [
  {
    key: 'u10',
    badge: '🏀 U-10',
    name: 'MBA U-10',
    headline: 'Första stegen på planen',
    subhead:
      'Grundläggande basketträning för barn mellan 7 och 10 år. Fokus på glädje, koordination och lagkänsla — inga tidigare erfarenheter krävs.',
    bullets: [
      'Certifierade ungdomsledare',
      'Tis + tor kl. 17:00 · Latinskolans sporthall',
      'Glädjefokuserat upplägg — match är på gång',
      'Föräldragrupp och social gemenskap kring laget',
    ],
    fee: '500 kr',
    feeUnit: '/ termin',
    schedule: 'Tis & Tor · 17:00 – 18:30',
    audience: 'Barn 7–10 år',
    mailtoSubject: 'Anmäl barn till MBA U-10',
    accent: 'sky',
  },
  {
    key: 'casual',
    badge: '🔥 Casual',
    name: 'Casual Games',
    headline: 'Pickup-basket, varje vecka',
    subhead:
      'Öppna spelkvällar för alla nivåer — kom när du kan, spela när du vill. Ingen turnering, ingen bindning, bara bra boll.',
    bullets: [
      'Alla nivåer välkomna — nybörjare till veteraner',
      'Ingen fast trupp — du bestämmer när du kommer',
      'Söndagar kl. 18:00 · Latinskolan',
      'Perfekt om du vill hitta community utan att commita till en säsong',
    ],
    fee: '500 kr',
    feeUnit: '/ termin',
    schedule: 'Söndagar · 18:00 – 20:00',
    audience: 'Vuxna, alla nivåer',
    mailtoSubject: 'Anmäl mig till MBA Casual Games',
    accent: 'yellow',
  },
  {
    key: 'div2',
    badge: '🏆 Herrlag',
    name: 'MBA Herrar · Div 2 Skåne',
    headline: 'Tävlingslaget — säsongen 2026/27',
    subhead:
      'Vi söker spelare med tävlingsvilja inför den uppflyttade Div 2-säsongen. Provspel öppet — matchtrupp sätts i augusti.',
    bullets: [
      'Två träningar/vecka + hemmamatcher på Latinskolan',
      'Professionell staff — tränare, fystränare, statistik',
      'Tröja, uppvärmning och matchkit ingår',
      'Resor till bortamatcher i Skåne organiseras av klubben',
    ],
    fee: '500 kr',
    feeUnit: '/ säsong',
    schedule: 'Mån + Ons · 19:30 – 21:30 + helgmatcher',
    audience: 'Män 18+, erfaren basket',
    mailtoSubject: 'Anmäl mig till provspel — MBA Herr Div 2',
    accent: 'navy',
  },
]

export default async function AnslutPage() {
  const [settings, courts] = await Promise.all([
    safeFetch<any>(QUERIES.settings, null),
    safeFetch<any[]>(QUERIES.courts, []),
  ])

  const contactEmail = settings?.contactEmail || 'mba.malmo.basket@gmail.com'

  return (
    <>
      <ScrollProgress />
      <BackToTop />
      <Navbar />

      <main className="page-hero section section-dark">
        <div className="contain">
          <div className="label r v">Bli medlem</div>
          <h1 className="title r v" style={{ marginBottom: '18px' }}>
            Tre vägar <em>in i familjen</em>
          </h1>
          <p className="page-lede r v">
            MBA är inte bara ett lag. Vi är en klubb för barn som tar sina
            första kliv på planen, vuxna som bara vill spela för nöjets skull,
            och tävlingsspelare som vill vinna i Div 2. Välj din väg nedan.
          </p>
        </div>
      </main>

      {/* Three-track cards */}
      <section className="section section-alt" id="tracks">
        <div className="contain">
          <div className="join-tracks">
            {TRACKS.map((t) => (
              <article key={t.key} className={`join-track join-track-${t.accent} r v`}>
                <div className="join-track-head">
                  <span className="join-track-badge">{t.badge}</span>
                  <span className="join-track-audience">{t.audience}</span>
                </div>

                <h2 className="join-track-name">{t.name}</h2>
                <h3 className="join-track-headline">{t.headline}</h3>
                <p className="join-track-sub">{t.subhead}</p>

                <ul className="join-track-bullets">
                  {t.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>

                <div className="join-track-meta">
                  <div className="join-track-schedule">
                    <span className="jt-label">Schema</span>
                    <span className="jt-value">{t.schedule}</span>
                  </div>
                </div>

                <div className="join-track-price">
                  <span className="jt-fee">{t.fee}</span>
                  <span className="jt-fee-unit">{t.feeUnit}</span>
                </div>

                <a
                  className="btn-cta join-track-cta"
                  href={`mailto:${contactEmail}?subject=${encodeURIComponent(t.mailtoSubject)}`}
                >
                  Anmäl intresse →
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / supporting info */}
      <section className="section section-dark">
        <div className="contain" style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="label r v">Frågor & svar</div>
          <h2 className="title r v" style={{ marginBottom: 28 }}>
            Vanliga <em>frågor</em>
          </h2>

          <div className="join-faq">
            <div className="join-faq-item">
              <h3>Behöver jag egen utrustning?</h3>
              <p>
                Inneskor med halksäker sula räcker för att börja. Boll och
                matchkläder får du genom klubben.
              </p>
            </div>
            <div className="join-faq-item">
              <h3>Måste jag bo i Malmö?</h3>
              <p>
                Nej. Träning och hemmamatcher är i Malmö (Latinskolan), men
                många spelare pendlar från grannkommunerna.
              </p>
            </div>
            <div className="join-faq-item">
              <h3>Hur hanteras avgiften?</h3>
              <p>
                Avgiften faktureras via Swish efter intresseanmälan och
                inskrivning. Syskonrabatt finns för U-10.
              </p>
            </div>
            <div className="join-faq-item">
              <h3>När börjar säsongen?</h3>
              <p>
                Höstsäsongen startar första veckan i september. Casual Games
                är igång året runt förutom juli.
              </p>
            </div>
          </div>

          <div style={{ marginTop: 36, textAlign: 'center' }}>
            <Link href="/" className="partners-back-link">
              ← Tillbaka till startsidan
            </Link>
          </div>
        </div>
      </section>

      <Footer settings={settings} courts={courts} />
    </>
  )
}
