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
import BackToTop from '@/components/BackToTop'
import Swish from '@/components/Swish'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Stöd MBA — Donera via Swish · Malmö Basket',
  description:
    'Stöd Malmös mest internationella basketfamilj. Donera direkt via Swish — varje krona går till tröjor, hallhyra och resor för säsongen.',
  alternates: { canonical: '/donera' },
}

export default async function DoneraPage() {
  const [settings, courts] = await Promise.all([
    safeFetch<any>(QUERIES.settings, null),
    safeFetch<any[]>(QUERIES.courts, []),
  ])

  return (
    <>
      <ScrollProgress />
      <BackToTop />
      <Navbar />
      <main id="main" style={{ paddingTop: 'clamp(48px, 8vw, 96px)' }}>
        {!settings?.swishNumber ? (
          <section className="section section-dark">
            <div className="contain" style={{ textAlign: 'center' }}>
              <div className="label r">Stöd klubben</div>
              <h1 className="title r" style={{ maxWidth: 720, margin: '0 auto' }}>
                Donera <em>kommer snart</em>
              </h1>
              <p style={{ marginTop: 16, opacity: 0.8 }}>
                Vi sätter upp Swish-numret den här veckan. Återkom snart, eller
                maila oss på{' '}
                <a href={`mailto:${settings?.contactEmail || 'mba.malmo.basket@gmail.com'}`}>
                  {settings?.contactEmail || 'mba.malmo.basket@gmail.com'}
                </a>
                .
              </p>
            </div>
          </section>
        ) : (
          <Swish settings={settings} num="01" numText="STÖD" className="section-dark" />
        )}
      </main>
      <Footer settings={settings} courts={courts} />
    </>
  )
}
