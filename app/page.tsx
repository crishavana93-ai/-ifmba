import { safeFetch, QUERIES } from '@/lib/sanity'
import Loader from '@/components/Loader'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Drop from '@/components/Drop'
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
import Courts from '@/components/Courts'
import Apparel from '@/components/Apparel'
import Sponsors from '@/components/Sponsors'
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

      {/* HERO — 3-line MALMÖ / BASKET / AMATÖRER */}
      <Hero settings={settings} />

      {/* DROP — Next tip-off split (video + countdown) */}
      <Drop settings={settings} media={media} />

      <Marquee />

      {/* 01 · IDENTITY (dark) */}
      <About settings={settings} num="01" numText="IDENTITY" className="section-dark" />

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

      {/* 07 · MALMÖ MAP (alt) */}
      <ScrollReveal>
        <Courts courts={courts} num="07" numText="MALMÖ MAP" className="section-alt" />
      </ScrollReveal>

      {/* 08 · THE DESK — consolidated news. */}
      <ScrollReveal>
        <News news={news} swedenNews={swedenNews} num="08" numText="THE DESK" className="section-dark" />
      </ScrollReveal>

      {/* 09 · APPAREL (alt) */}
      <ScrollReveal>
        <Apparel media={media} num="09" numText="APPAREL" className="section-alt" />
      </ScrollReveal>

      {/* 10 · VÅR RESA (dark) */}
      <ScrollReveal>
        <Journey num="10" numText="VÅR RESA" className="section-dark" />
      </ScrollReveal>

      {/* 11 · PARTNERS (alt) */}
      <ScrollReveal>
        <Sponsors sponsors={sponsors} num="11" numText="PARTNERS" className="section-alt" />
      </ScrollReveal>

      {/* Manifesto + JoinCTA removed 2026-04-24 — self-referential copy and
          the big "JOIN THE FAMILY" tile were closing-section noise. Sponsors
          (section 11) is now the final content block before the footer. The
          footer already contains Contact + newsletter signup, so the CTA
          function is preserved. To restore, re-add both sections here. */}

      <Footer settings={settings} />
    </>
  )
}
