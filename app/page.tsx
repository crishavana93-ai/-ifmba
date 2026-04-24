import { safeFetch, QUERIES } from '@/lib/sanity'
import Loader from '@/components/Loader'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
// Drop (next tip-off split) retired 2026-04-24 — rendered empty without nextMatchDate.
import Marquee from '@/components/Marquee'
import StatsBar from '@/components/StatsBar'
import About from '@/components/About'
import Journey from '@/components/Journey'
import News from '@/components/News'
// SwedenNews component kept in repo but no longer rendered on landing.
// (User consolidated: one news block on home, dedicated /nyheter page for full feed.)
import Standings from '@/components/Standings'
// SwishMeter retired 2026-04-24 — fixtures/results now live in Standings via Profixio.
import Squad from '@/components/Squad'
import MediaWall from '@/components/MediaWall'
import Highlights from '@/components/Highlights'
// Courts moved off the landing page 2026-04-24 → lives at /hallar (dedicated
// page) + a condensed summary in the Footer. Component file kept in
// /components for the new page to reuse.
import Apparel from '@/components/Apparel'
// Sponsors moved off the landing page 2026-04-24 — now lives only at /partners.
// Homepage gets a compact teaser (see SponsorTeaser below) that routes to /partners.
import SponsorTeaser from '@/components/SponsorTeaser'
import Spotlight from '@/components/Spotlight'
// Manifesto + JoinCTA retired 2026-04-24 — kept in /components for easy revival.
import Footer from '@/components/Footer'
import ScrollReveal from '@/components/ScrollReveal'
import ScrollProgress from '@/components/ScrollProgress'
import BackToTop from '@/components/BackToTop'

export const revalidate = 60 // ISR: revalidate every 60 seconds

export default async function Home() {
  // `fixtures` and `results` are no longer rendered (SwishMeter retired).
  // When Profixio scraping lands, reintroduce them here and wire into Standings.
  const [
    players,
    standings,
    courts,
    sponsors,
    news,
    settings,
    media,
    swedenNews,
  ] = await Promise.all([
    safeFetch<any[]>(QUERIES.players, []),
    safeFetch<any[]>(QUERIES.standings, []),
    safeFetch<any[]>(QUERIES.courts, []),
    safeFetch<any[]>(QUERIES.sponsors, []),
    safeFetch<any[]>(QUERIES.news, []),
    safeFetch<any>(QUERIES.settings, null),
    safeFetch<any[]>(QUERIES.mediaAll, []),
    safeFetch<any[]>(QUERIES.swedenNews, []),
  ])

  return (
    <>
      <Loader />
      <ScrollProgress />
      <BackToTop />
      <Navbar />

      <main id="main">
      {/* HERO — 3-line MALMÖ / BASKET / AMATÖRER */}
      <Hero settings={settings} />

      {/* Drop section (Next tip-off split) retired 2026-04-24 — rendered
          as a big empty navy block whenever `nextMatchDate` wasn't set in
          Sanity. Component kept in /components in case we revive a
          match-day countdown on a future match page. */}

      <Marquee />

      {/* 01 · IDENTITY (dark) — wrapped in ScrollReveal so the `.r` children
          (label, title, body, flags) actually fade in. Without this wrapper
          they stay at opacity:0 forever and the section renders as a big
          empty black box right after the marquee. */}
      <ScrollReveal>
        <About settings={settings} num="01" numText="IDENTITY" className="section-dark" />
      </ScrollReveal>

      {/* 02 · SEASON IN PHOTOS (alt) */}
      <ScrollReveal>
        <MediaWall media={media} num="02" numText="SEASON IN PHOTOS" className="section-alt" />
      </ScrollReveal>

      {/* 03 · TOP PLAYS (dark) */}
      <ScrollReveal>
        <Highlights media={media} num="03" numText="TOP PLAYS" className="section-dark" />
      </ScrollReveal>

      {/* 04 · FANS RÖSTAR — Match + Season player ballots (alt) */}
      {players.length > 0 && (
        <ScrollReveal>
          <Spotlight
            players={players}
            num="04"
            numText="FANS RÖSTAR"
            className="section-alt"
          />
        </ScrollReveal>
      )}

      {/* 05 · THE GRID (dark) */}
      <ScrollReveal>
        <Standings standings={standings} num="05" numText="THE GRID" className="section-dark" />
      </ScrollReveal>

      {/* SwishMeter removed 2026-04-24 — data now lives in Standings (Profixio).
          Fan-vote / Spotlight moved into the next position. */}

      {/* 06 · THE FAMILY (dark) */}
      <ScrollReveal>
        <Squad players={players} num="06" numText="THE FAMILY" className="section-dark" />
      </ScrollReveal>

      {/* StatsBar — band between sections */}
      <StatsBar players={players} standings={standings} />

      {/* Courts / MALMÖ MAP retired from homepage 2026-04-24 → dedicated
          /hallar page + footer summary. Courts component is still imported
          by /hallar. */}

      {/* 07 · THE DESK — consolidated news. */}
      <ScrollReveal>
        <News news={news} swedenNews={swedenNews} num="07" numText="THE DESK" className="section-dark" />
      </ScrollReveal>

      {/* 08 · APPAREL (alt) */}
      <ScrollReveal>
        <Apparel media={media} num="08" numText="APPAREL" className="section-alt" />
      </ScrollReveal>

      {/* 09 · VÅR RESA (dark) */}
      <ScrollReveal>
        <Journey num="09" numText="VÅR RESA" className="section-dark" />
      </ScrollReveal>

      {/* 10 · BLI PARTNER — compact teaser that routes traffic to the
          dedicated /partners page. Full tier breakdown + lead form live
          there so the landing page stays focused and fast. */}
      <ScrollReveal>
        <SponsorTeaser sponsorCount={sponsors?.length || 0} num="10" numText="PARTNERS" />
      </ScrollReveal>

      </main>

      <Footer settings={settings} courts={courts} />
    </>
  )
}
