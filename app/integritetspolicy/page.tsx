/**
 * /integritetspolicy — Swedish-language GDPR privacy policy.
 *
 * Stub generated 2026-04-24. Review with a lawyer before you rely on it
 * for a live dispute — the structure is correct but specific retention
 * periods, processor contracts, and SAR procedures should be verified
 * against how MBA actually operates.
 */
import Link from 'next/link'
import type { Metadata } from 'next'
import { safeFetch, QUERIES } from '@/lib/sanity'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollProgress from '@/components/ScrollProgress'
import BackToTop from '@/components/BackToTop'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Integritetspolicy — MBA · Malmö Basket',
  description:
    'Hur MBA — Malmö Basket samlar in, använder och skyddar dina personuppgifter enligt GDPR.',
  alternates: { canonical: '/integritetspolicy' },
  robots: { index: true, follow: true },
}

export default async function PrivacyPage() {
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

      <main id="main" className="legal-page section section-alt">
        <div className="contain" style={{ maxWidth: 820, margin: '0 auto' }}>
          <div className="label">Integritet &amp; GDPR</div>
          <h1 className="title" style={{ marginBottom: 18 }}>
            Integritetspolicy
          </h1>
          <p className="page-lede" style={{ marginBottom: 36 }}>
            Senast uppdaterad: 24 april 2026. Denna policy beskriver hur
            Malmö Basket Amatörer (&quot;MBA&quot;, &quot;vi&quot;, &quot;oss&quot;) hanterar personuppgifter i
            samband med drift av ifmba.se och klubbverksamheten.
          </p>

          <section className="legal-section">
            <h2>1. Personuppgiftsansvarig</h2>
            <p>
              Malmö Basket Amatörer är personuppgiftsansvarig för behandlingen av
              dina personuppgifter. Kontakt:{' '}
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Vilka uppgifter vi samlar in</h2>
            <ul>
              <li>
                <strong>Nyhetsbrev:</strong> E-postadress, tidpunkt för
                prenumeration och samtycke.
              </li>
              <li>
                <strong>Sponsorförfrågningar:</strong> Namn, företag, e-post,
                telefon (frivilligt), budgetintervall och meddelande.
              </li>
              <li>
                <strong>Medlemsintresse:</strong> Namn och e-post som skickas
                via &quot;Anmäl intresse&quot;-knappar.
              </li>
              <li>
                <strong>Röstning (Fans röstar):</strong> Lagras lokalt i din
                webbläsare (localStorage). Vi sparar inga rösträknare på
                server som kopplas till dig som person.
              </li>
              <li>
                <strong>Statistik:</strong> Aggregerad, anonym trafikdata via
                Plausible Analytics — utan cookies, utan personidentifierare.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Rättslig grund</h2>
            <p>
              Vi behandlar dina uppgifter baserat på <em>samtycke</em>
              {' '}(nyhetsbrev, medlemsintresse),{' '}
              <em>avtal och berättigat intresse</em> (sponsorkontakt,
              medlemshantering), och{' '}
              <em>rättslig förpliktelse</em> (bokföring vid betald
              medlemsavgift).
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Hur länge vi sparar uppgifter</h2>
            <ul>
              <li>Nyhetsbrev: Tills du avslutar prenumerationen.</li>
              <li>
                Sponsorförfrågningar: 24 månader efter senaste kontakt, därefter
                anonymiseras eller raderas.
              </li>
              <li>
                Medlemsavgifter (bokföring): 7 år enligt bokföringslagen.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Mottagare &amp; databehandlare</h2>
            <ul>
              <li>Sanity.io (Irland/EU) — innehållshantering (CMS).</li>
              <li>Vercel (Tyskland/EU) — webbhotell.</li>
              <li>Resend (EU) — utskick av bekräftelsemejl.</li>
              <li>Plausible (EU) — anonym trafikstatistik.</li>
              <li>Swish / Billmate — betalhantering vid medlemsavgift.</li>
            </ul>
            <p>
              Vi säljer aldrig dina uppgifter till tredje part. Samtliga
              leverantörer har vi ett databehandlaravtal (DPA) med.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Dina rättigheter</h2>
            <p>
              Enligt GDPR har du rätt att begära registerutdrag, rättelse,
              radering (&quot;rätten att bli bortglömd&quot;), begränsning av behandling,
              dataportabilitet och att invända mot behandling. Skicka din
              begäran till{' '}
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a> — vi
              svarar inom 30 dagar.
            </p>
            <p>
              Du har även rätt att lämna klagomål till Integritetsskyddsmyndigheten
              (IMY) på{' '}
              <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer">
                imy.se
              </a>.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Cookies &amp; spårning</h2>
            <p>
              ifmba.se använder inga spårningscookies. Den tekniska lagring
              som förekommer är begränsad till:
            </p>
            <ul>
              <li>
                <strong>localStorage:</strong> Röstning, installationsuppmaning
                för PWA, samtyckesnotis — lagras lokalt i din webbläsare och
                överförs inte till oss.
              </li>
              <li>
                <strong>Plausible:</strong> Cookielös webbstatistik, inga
                personidentifierare.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Säkerhet</h2>
            <p>
              Webbplatsen körs över HTTPS med moderna säkerhetsheaders (CSP,
              HSTS, X-Frame-Options). Serverside-lagring är krypterad i vila
              hos våra EU-baserade leverantörer.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Ändringar</h2>
            <p>
              Denna policy kan uppdateras. Väsentliga ändringar kommuniceras
              via e-post (om du prenumererar på nyhetsbrevet) eller på denna
              sida. Nuvarande version gäller från och med datumet ovan.
            </p>
          </section>

          <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
            <Link href="/" className="partners-back-link">
              ← Tillbaka till startsidan
            </Link>
          </div>
        </div>
      </main>

      <Footer settings={settings} courts={courts} />
    </>
  )
}
