/**
 * /hallar — dedicated "Where we play" page.
 *
 * Consolidates home arena info + any additional training courts that live
 * in the Sanity `court` schema. Replaces the MALMÖ MAP homepage section
 * (which was retired to shorten the landing page).
 *
 * Data: GROQ `courts` query from Sanity. If empty, we fall back to a
 * hardcoded Latinskolan entry so the page is never blank.
 */
import Link from 'next/link'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollProgress from '@/components/ScrollProgress'
import BackToTop from '@/components/BackToTop'
import { safeFetch, QUERIES, urlFor } from '@/lib/sanity'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Hallar & planer — MBA · Malmö Basket',
  description:
    'Latinskolans sporthall är MBA:s hemmaarena. Se träningstider, parkering, kommunikationer och övriga planer vi spelar på.',
  alternates: { canonical: '/hallar' },
}

type Court = {
  _id: string
  name: string
  type?: 'Indoor' | 'Outdoor' | string
  description?: string
  address?: string
  isHome?: boolean
  photo?: any
  gallery?: any[]
  lat?: number
  lng?: number
}

// Fallback when Sanity returns nothing — keeps the page usable on day one.
const FALLBACK_COURTS: Court[] = [
  {
    _id: 'latinskolan',
    name: 'Latinskolans sporthall',
    type: 'Indoor',
    address: 'Lorensborgsgatan 1, 217 45 Malmö',
    isHome: true,
    description:
      'MBA:s hemmaarena. Alla hemmamatcher i Div 3 Skåne Herr spelas här, ' +
      'liksom den övervägande delen av veckoträningarna.',
  },
]

// When the match-day schedule is the same across all courts, render a single
// schedule panel. If you later differentiate per court, move this into Sanity.
const WEEKLY_SCHEDULE = [
  { day: 'Måndag',  slot: '19:30 – 21:30', team: 'Herr Div 2 · träning' },
  { day: 'Tisdag',  slot: '17:00 – 18:30', team: 'U-10 · träning' },
  { day: 'Onsdag',  slot: '19:30 – 21:30', team: 'Herr Div 2 · träning' },
  { day: 'Torsdag', slot: '17:00 – 18:30', team: 'U-10 · träning' },
  { day: 'Söndag',  slot: '18:00 – 20:00', team: 'Casual Games · öppet spel' },
]

function gmapsHref(c: Court) {
  if (c.lat != null && c.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`
  }
  const q = encodeURIComponent(`${c.name}${c.address ? ', ' + c.address : ''}`)
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

export default async function HallarPage() {
  const [courtsRaw, settings] = await Promise.all([
    safeFetch<Court[]>(QUERIES.courts, []),
    safeFetch<any>(QUERIES.settings, null),
  ])

  const courts = courtsRaw.length > 0 ? courtsRaw : FALLBACK_COURTS
  const home = courts.find((c) => c.isHome) || courts[0]
  const others = courts.filter((c) => c._id !== home?._id)

  return (
    <>
      <ScrollProgress />
      <BackToTop />
      <Navbar />

      {/* Hero */}
      <main className="page-hero section section-dark">
        <div className="contain">
          <div className="label r v">Malmö basketball map</div>
          <h1 className="title r v" style={{ marginBottom: 18 }}>
            Där vi <em>spelar</em>
          </h1>
          <p className="page-lede r v">
            {home?.name || 'Latinskolans sporthall'} är vår hemmaarena — plats
            för alla MBA:s hemmamatcher och veckoträningar. Nedan hittar du
            adress, schema och hur du tar dig hit.
          </p>
        </div>
      </main>

      {/* Home arena card */}
      {home && (
        <section className="section section-alt">
          <div className="contain">
            <div className="hall-home">
              <div className="hall-home-photo">
                {home.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={urlFor(home.photo).width(1200).height(800).fit('crop').url()}
                    alt={home.name}
                  />
                ) : (
                  <div className="hall-home-photo-placeholder">
                    🏟️
                    <span>Foto kommer snart</span>
                  </div>
                )}
                {home.isHome && <span className="hall-home-badge">Hemmaarena</span>}
              </div>

              <div className="hall-home-body">
                <div className="label">Hemmaplan</div>
                <h2 className="hall-home-name">{home.name}</h2>
                {home.type && <div className="hall-home-type">{home.type}</div>}
                {home.address && (
                  <div className="hall-home-addr">
                    <span>Adress</span>
                    <strong>{home.address}</strong>
                  </div>
                )}
                {home.description && (
                  <p className="hall-home-desc">{home.description}</p>
                )}
                <div className="hall-home-cta">
                  <a
                    className="btn-cta"
                    href={gmapsHref(home)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Öppna i Google Maps →
                  </a>
                  <Link href="/anslut" className="btn-cta btn-cta-ghost">
                    Bli medlem
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Weekly schedule */}
      <section className="section section-dark">
        <div className="contain" style={{ maxWidth: 880, margin: '0 auto' }}>
          <div className="label r v">Veckoschema</div>
          <h2 className="title r v" style={{ marginBottom: 28 }}>
            Tränings- och <em>spelpass</em>
          </h2>
          <div className="hall-schedule">
            {WEEKLY_SCHEDULE.map((s) => (
              <div key={s.day} className="hall-schedule-row">
                <div className="hall-schedule-day">{s.day}</div>
                <div className="hall-schedule-slot">{s.slot}</div>
                <div className="hall-schedule-team">{s.team}</div>
              </div>
            ))}
          </div>
          <p className="hall-schedule-note">
            Schemat kan justeras vid matchhelger. Kolla aktuella matcher på{' '}
            <a
              href="https://www.profixio.com/app/leagueid16182/category/1150620"
              target="_blank"
              rel="noopener noreferrer"
            >
              Profixio · Div 3 Skåne
            </a>.
          </p>
        </div>
      </section>

      {/* Other courts */}
      {others.length > 0 && (
        <section className="section section-alt">
          <div className="contain">
            <div className="label r v">Övriga planer</div>
            <h2 className="title r v" style={{ marginBottom: 28 }}>
              Utomhus & <em>extra</em>
            </h2>
            <div className="hall-grid">
              {others.map((c) => (
                <article key={c._id} className="hall-card">
                  {c.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={urlFor(c.photo).width(800).height(500).fit('crop').url()}
                      alt={c.name}
                      className="hall-card-img"
                    />
                  )}
                  <div className="hall-card-body">
                    <div className="hall-card-type">
                      {c.type || 'Court'}{c.isHome ? ' · Hemmaarena' : ''}
                    </div>
                    <h3 className="hall-card-name">{c.name}</h3>
                    {c.address && <div className="hall-card-addr">{c.address}</div>}
                    {c.description && <p className="hall-card-desc">{c.description}</p>}
                    <a
                      className="hall-card-link"
                      href={gmapsHref(c)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Öppna på karta →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Getting there */}
      <section className="section section-dark">
        <div className="contain" style={{ maxWidth: 860, margin: '0 auto' }}>
          <div className="label r v">Ta dig hit</div>
          <h2 className="title r v" style={{ marginBottom: 28 }}>
            Kommunikationer & <em>parkering</em>
          </h2>

          <div className="hall-how-grid">
            <div>
              <h3>🚌 Buss &amp; cykel</h3>
              <p>
                Närmaste busshållplats är ca 5 min promenad från Latinskolans
                sporthall. Bra cykelparkering direkt utanför entrén.
              </p>
            </div>
            <div>
              <h3>🚆 Tåg / Pågatåg</h3>
              <p>
                Från Malmö C tar det ca 10 minuter med buss eller cykel. Taxi
                eller promenad är ett alternativ för kvällsmatcher.
              </p>
            </div>
            <div>
              <h3>🅿️ Parkering</h3>
              <p>
                Betalparkering längs gatan. Gratis helgparkering efter kl. 18:00.
                På matchdagar är det högt tryck — var ute i god tid.
              </p>
            </div>
            <div>
              <h3>♿ Tillgänglighet</h3>
              <p>
                Hallen är rullstolstillgänglig. Behöver ni speciell hjälp?
                Skicka ett mail så möter vi upp vid entrén.
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
