/**
 * /donera — dedicated Swish donation landing page.
 *
 * Direct URL we can paste into Instagram bio, match-day slides, and
 * physical posters in the arena. The body shares its component with the
 * homepage Swish band so config (number, message, goal) only lives in
 * one Sanity record.
 */
import type { Metadata } from 'next'
import { safeFetch, QUERIES } from '@/lib/sanity'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollProgress from '@/components/ScrollProgress'
import ScrollReveal from '@/components/ScrollReveal'
import BackToTop from '@/components/BackToTop'
import Swish from '@/components/Swish'
import GearDonations from '@/components/GearDonations'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Stöd MBA — Donera via Swish · Malmö Basket',
  description:
    'Stöd Malmös mest internationella basketfamilj. Donera direkt via Swish — varje krona går till tröjor, hallhyra och resor för säsongen.',
  alternates: { canonical: '/donera' },
  openGraph: {
    title: 'Stöd MBA — Donera via Swish · Malmö Basket',
    description: 'Stöd Malmös mest internationella basketfamilj. Donera direkt via Swish — varje krona går till tröjor, hallhyra och resor för säsongen.',
    url: '/donera',
    siteName: 'MBA — Malmö Basket',
    locale: 'sv_SE',
    type: 'website',
  },
}

// Club fees payable via Swish (Cris 2026-08-02). Shown on /donera so every
// member finds the right amount; /anslut FAQ links here (#avgifter).
const FEES: { amount: string; label: string; note?: string }[] = [
  { amount: '100 kr', label: 'Årsavgift — medlemskap', note: 'Betalas senast 1 augusti' },
  { amount: '500 kr', label: 'Träningsavgift — betalande lagspelare' },
  { amount: '750 kr', label: 'Träningsavgift — casual player' },
  { amount: '1 500 kr', label: 'Administrationsavgift' },
  { amount: '2 000 kr', label: 'Lagavgift — D2 & D3' },
]

export default async function DoneraPage() {
  const [settings, courts, media] = await Promise.all([
    safeFetch<any>(QUERIES.settings, null),
    safeFetch<any[]>(QUERIES.courts, []),
    safeFetch<any[]>(QUERIES.mediaAll, []),
  ])

  return (
    <>
      <ScrollProgress />
      <BackToTop />
      <Navbar />
      <main id="main" style={{ paddingTop: 'clamp(48px, 8vw, 96px)' }}>
        {!settings?.swishNumber ? (
          // Static placeholder — NO `.r` reveal class here. The reveal system
          // keeps `.r` elements at opacity:0 until a `<ScrollReveal>` ancestor
          // observes them; without that wrapper the page renders blank.
          <section className="section section-dark">
            <div className="contain" style={{ textAlign: 'center' }}>
              <div className="label">Stöd klubben</div>
              <h1 className="title" style={{ maxWidth: 720, margin: '0 auto' }}>
                Donera <em>kommer snart</em>
              </h1>
              <p style={{ marginTop: 16, opacity: 0.85, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
                Vi sätter upp Swish-numret den här veckan. Återkom snart, eller
                maila oss på{' '}
                <a href={`mailto:${settings?.contactEmail || 'info@ifmba.se'}`} style={{ color: 'var(--yellow)' }}>
                  {settings?.contactEmail || 'info@ifmba.se'}
                </a>
                .
              </p>
            </div>
          </section>
        ) : (
          // Swish.tsx uses `.r` classes internally for label/title, so wrap it
          // in ScrollReveal so those elements actually become visible.
          <ScrollReveal>
            <Swish settings={settings} num="01" numText="STÖD" className="section-dark" />
          </ScrollReveal>
        )}

        {/* Club fees via Swish — always rendered; falls back to the official
            club number if Sanity's swishNumber isn't set yet. */}
        <section className="section section-alt" id="avgifter">
          <div className="contain" style={{ maxWidth: 860 }}>
            <div className="label">Avgifter</div>
            <h2 className="title" style={{ marginBottom: 12 }}>
              Medlems- &amp; lag<em>avgifter</em>
            </h2>
            <p style={{ opacity: 0.85, maxWidth: 620, marginBottom: 8 }}>
              Alla avgifter betalas via Swish till klubbens nummer. Ange ditt
              namn + vad betalningen gäller i meddelandefältet.
            </p>
            <p
              style={{
                fontSize: 'clamp(22px, 3vw, 32px)',
                fontWeight: 800,
                letterSpacing: '0.04em',
                color: 'var(--yellow)',
                marginBottom: 28,
              }}
            >
              Swish: {settings?.swishNumber
                ? settings.swishNumber.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')
                : '123 066 18 76'}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
              {FEES.map((f) => (
                <li
                  key={f.label}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '14px 18px',
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <span>
                    {f.label}
                    {f.note && (
                      <span style={{ display: 'block', fontSize: 13, opacity: 0.65 }}>{f.note}</span>
                    )}
                  </span>
                  <strong style={{ whiteSpace: 'nowrap', fontSize: 18 }}>{f.amount}</strong>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* In-kind gear donations — independent of swishNumber. Hides itself
            if gearWhatsappNumber is not set in Sanity. */}
        <ScrollReveal>
          <GearDonations
            settings={settings}
            media={media}
            num="02"
            numText="UTRUSTNING"
            className="section-alt"
          />
        </ScrollReveal>
      </main>
      <Footer settings={settings} courts={courts} />
    </>
  )
}
