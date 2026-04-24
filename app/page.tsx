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
import SwishMeter from '@/components/SwishMeter'
import Squad from '@/components/Squad'
import MediaWall from '@/components/MediaWall'
import Highlights from '@/components/Highlights'
import Courts from '@/components/Courts'
import Apparel from '@/components/Apparel'
import Sponsors from '@/components/Sponsors'
import Spotlight from '@/components/Spotlight'
import Manifesto from '@/components/Manifesto'
import JoinCTA from '@/components/JoinCTA'
import Footer from '@/components/Footer'
import ScrollReveal from '@/components/ScrollReveal'
import ScrollProgress from '@/components/ScrollProgress'
import BackToTop from '@/components/BackToTop'

export const revalidate = 60 // ISR: revalidate every 60 seconds

export default async function Home() {
  const [
    players,
    standings,
    fixtures,
    results,
    courts,
    sponsors,
    news,
    settings,
    media,
    swedenNews,
  ] = await Promise.all([
    safeFetch<any[]>(QUERIES.players, []),
    safeFetch<any[]>(QUERIES.standings, []),
    safeFetch<any[]>(QUERIES.fixtures, []),
    safeFetch<any[]>(QUERIES.results, []),
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

      {/* 04 · PLAYER OF THE MONTH (alt) */}
      {(settings?.spotlightPlayer || players.length > 0) && (
        <ScrollReveal>
          <Spotlight
            settings={settings}
            players={players}
            num="04"
            numText="PLAYER OF THE MONTH"
            className="section-alt"
          />
        </ScrollReveal>
      )}

      {/* 05 · THE GRID (dark) */}
      <ScrollReveal>
        <Standings standings={standings} num="05" numText="THE GRID" className="section-dark" />
      </ScrollReveal>

      {/* 06 · TERMINAL (alt) */}
      <ScrollReveal>
        <SwishMeter
          fixtures={fixtures}
          results={results}
          num="06"
          numText="TERMINAL"
          className="section-alt"
        />
      </ScrollReveal>

      {/* 07 · THE FAMILY (dark) */}
      <ScrollReveal>
        <Squad players={players} num="07" numText="THE FAMILY" className="section-dark" />
      </ScrollReveal>

      {/* StatsBar — band between sections */}
      <StatsBar players={players} standings={standings} />

      {/* 08 · MALMÖ MAP (alt) */}
      <ScrollReveal>
        <Courts courts={courts} num="08" numText="MALMÖ MAP" className="section-alt" />
      </ScrollReveal>

      {/* 09 · THE DESK — consolidated news (dark).
          NOTE: old section 10 COURT REPORT was removed; SwedenNews still
          exists in Studio so the editorial team can curate external Swedish
          basketball news there. Future: ingest basket.se + svt.se RSS
          feeds server-side into the swedenNews schema on a cron. */}
      <ScrollReveal>
        <News news={news} swedenNews={swedenNews} num="09" numText="THE DESK" className="section-dark" />
      </ScrollReveal>

      {/* 10 · APPAREL (alt) */}
      <ScrollReveal>
        <Apparel media={media} num="10" numText="APPAREL" className="section-alt" />
      </ScrollReveal>

      {/* 11 · VÅR RESA (dark) */}
      <ScrollReveal>
        <Journey num="11" numText="VÅR RESA" className="section-dark" />
      </ScrollReveal>

      {/* 12 · PARTNERS (alt) */}
      <ScrollReveal>
        <Sponsors sponsors={sponsors} num="12" numText="PARTNERS" className="section-alt" />
      </ScrollReveal>

      {/* 13 · MANIFESTO (dark) — thesis / rallying crescendo before the CTA */}
      <ScrollReveal>
        <Manifesto num="13" numText="MANIFESTO" className="section-dark" />
      </ScrollReveal>

      {/* 14 · BE PART OF IT (alt) */}
      <JoinCTA num="14" numText="BE PART OF IT" className="section-alt" />

      <Footer settings={settings} />
    </>
  )
}
