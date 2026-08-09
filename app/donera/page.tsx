/**
 * /donera — Swish PAYMENT landing page.
 *
 * Reframed 2026-08-03: Swish is how members pay club fees (membership,
 * training, team) — not a donation box. URL kept as /donera because it's
 * already printed on posters and pasted in bios; the content and metadata
 * now lead with payments. The body shares its component with the homepage
 * Swish band so config (number, message) only lives in one Sanity record.
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
  title: 'Betala via Swish — Avgifter · MBA Malmö Basket',
  description:
    'Betala medlems-, tränings- och lagavgifter till MBA via Swish. Skanna QR-koden eller använd klubbens Swish-nummer — skriv namn + vad betalningen gäller.',
  alternates: { canonical: '/donera' },
}

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
              <div className="label">Betalningar</div>
              <h1 className="title" style={{ maxWidth: 720, margin: '0 auto' }}>
                Swish-betalning <em>kommer snart</em>
              </h1>
              <p style={{ marginTop: 16, opacity: 0.85, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
                Vi sätter upp klubbens Swish-nummer den här veckan. Återkom
                snart, eller maila oss på{' '}
                <a href={`mailto:${settings?.contactEmail || 'teammba040@gmail.com'}`} style={{ color: 'var(--yellow)' }}>
                  {settings?.contactEmail || 'teammba040@gmail.com'}
                </a>
                .
              </p>
            </div>
          </section>
        ) : (
          // Swish.tsx uses `.r` classes internally for label/title, so wrap it
          // in ScrollReveal so those elements actually become visible.
          <ScrollReveal>
            <Swish settings={settings} num="01" numText="BETALA" className="section-dark" />
          </ScrollReveal>
        )}

        {/* In-kind gear donations — independent of swishNumber. This one IS
            a donation programme (gear for international communities) and
            keeps its donation language. Hides itself if neither
            gearContactEmail nor gearWhatsappNumber is set in Sanity. */}
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
