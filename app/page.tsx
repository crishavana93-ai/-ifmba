import { safeFetch, QUERIES } from '@/lib/sanity'
import Loader from '@/components/Loader'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
// Drop (next tip-off split) retired 2026-04-24 — rendered empty without nextMatchDate.
import StatsBar from '@/components/StatsBar'
import About from '@/components/About'
// Journey retired from the landing page 2026-08-03 (audit): static origin
// timeline duplicated the About story and added a full extra scroll. Component
// kept in /components — one import + one JSX block to revive.
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
import Predict from '@/components/Predict'
import Swish from '@/components/Swish'
// GearDonations retired from the landing page 2026-08-03 (audit): it already
// has a full home on /donera and made the landing page one section too long.
// Manifesto + JoinCTA retired 2026-04-24 — kept in /components for easy revival.
import Footer from '@/components/Footer'
import ScrollReveal from '@/components/ScrollReveal'
import ScrollProgress from '@/components/ScrollProgress'
import BackToTop from '@/components/BackToTop'
import CinematicScroll from '@/components/CinematicScroll'
import BannerTape from '@/components/BannerTape'
import TeamCollage from '@/components/TeamCollage'

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
    shopProducts,
  ] = await Promise.all([
    safeFetch<any[]>(QUERIES.players, []),
    safeFetch<any[]>(QUERIES.standings, []),
    safeFetch<any[]>(QUERIES.courts, []),
    safeFetch<any[]>(QUERIES.sponsors, []),
    safeFetch<any[]>(QUERIES.news, []),
    safeFetch<any>(QUERIES.settings, null),
    safeFetch<any[]>(QUERIES.mediaAll, []),
    safeFetch<any[]>(QUERIES.swedenNews, []),
    safeFetch<any[]>(QUERIES.shopProducts, []),
  ])

  // Prediction data — fetched separately so the homepage still renders if
  // no rounds exist yet. Active round powers the form, latest final powers
  // the leaderboard.
  const [predictionActive, predictionFinal] = await Promise.all([
    safeFetch<any>(QUERIES.predictionActive, null),
    safeFetch<any>(QUERIES.predictionLatestFinal, null),
  ])

  const CINE = process.env.NEXT_PUBLIC_CINEMATIC === '1'
  const teamPhotos = (media || [])
    .filter((m: any) => m?.imageUrl && m?.kind !== 'video' &&
      ['team', 'fans', 'gameday', 'matchday', 'community'].includes(m?.category))
    .map((m: any) => m.imageUrl)

  return (
    <>
      <Loader />
      <ScrollProgress />
      <BackToTop />
      <Navbar />

      <main id="main">
      {process.env.NEXT_PUBLIC_CINEMATIC === '1' && <CinematicScroll />}
      {/* HERO — 3-line MALMÖ / BASKET / AMATÖRER */}
      <Hero settings={settings} />

      {/* Drop section (Next tip-off split) retired 2026-04-24 — rendered
          as a big empty navy block whenever `nextMatchDate` wasn't set in
          Sanity. Component kept in /components in case we revive a
          match-day countdown on a future match page. */}

      <BannerTape />

      {/* 01 · IDENTITY (dark) — wrapped in ScrollReveal so the `.r` children
          (label, title, body, flags) actually fade in. Without this wrapper
          they stay at opacity:0 forever and the section renders as a big
          empty black box right after the marquee. */}
      <ScrollReveal>
        <About settings={settings} num="01" numText="IDENTITY" className="section-dark" />
      </ScrollReveal>

      {/* 02 · SEASON IN PHOTOS — stacking cards (cinematic) else grid.
          TeamCollage carries id="media" so the GALLERI nav link works in
          cinematic mode too, and fades in/out with scroll. */}
      {CINE ? (
        <TeamCollage images={teamPhotos} label="02 · SÄSONGEN I BILDER" title="FAMILJEN" />
      ) : (
      <ScrollReveal>
        <MediaWall media={media} num="02" numText="SEASON IN PHOTOS" className="section-alt" />
      </ScrollReveal>
      )}

      {/* 03 · TOP PLAYS (dark) — hides itself when no clips are uploaded
          (audit 2026-08-03). */}
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

      {/* 05 · TIPPA — predict-the-score form + leaderboard (alt).
          Hidden if neither an active round nor a finalized round exists. */}
      <ScrollReveal>
        <Predict
          active={predictionActive}
          latestFinal={predictionFinal}
          num="05"
          numText="TIPPA"
          className="section-alt"
        />
      </ScrollReveal>

      {/* 06 · THE GRID (dark) */}
      <ScrollReveal>
        <Standings standings={standings} num="06" numText="THE GRID" className="section-dark" />
      </ScrollReveal>

      {/* 07 · THE FAMILY (dark) */}
      <ScrollReveal>
        <Squad players={players} num="07" numText="THE FAMILY" className="section-dark" />
      </ScrollReveal>

      {/* StatsBar — band between sections */}
      <StatsBar players={players} standings={standings} />

      {/* Courts / MALMÖ MAP retired from homepage 2026-04-24 → dedicated
          /hallar page + footer summary. Courts component is still imported
          by /hallar. */}

      {/* 08 · THE DESK — consolidated news. */}
      <ScrollReveal>
        <News news={news} swedenNews={swedenNews} num="08" numText="THE DESK" className="section-dark" />
      </ScrollReveal>

      {/* 09 · APPAREL (alt) */}
      <ScrollReveal>
        <Apparel products={shopProducts} media={media} num="09" numText="APPAREL" className="section-alt" />
      </ScrollReveal>

      {/* Journey (VÅR RESA) retired 2026-08-03 (audit) — origin story now
          lives inside About/identity; timeline component kept in /components. */}

      {/* 10 · BLI PARTNER — compact teaser that routes traffic to the
          dedicated /partners page. Full tier breakdown + lead form live
          there so the landing page stays focused and fast. */}
      <ScrollReveal>
        <SponsorTeaser sponsorCount={sponsors?.length || 0} num="10" numText="PARTNERS" />
      </ScrollReveal>

      {/* 11 · BETALA — Swish payments (fees). Reframed from donations
          2026-08-03. Renders null entirely if `swishNumber` isn't set in
          Sanity, so the page degrades gracefully. */}
      <ScrollReveal>
        <Swish settings={settings} num="11" numText="BETALA" className="section-dark" />
      </ScrollReveal>

      {/* GearDonations retired from home 2026-08-03 (audit) — lives on
          /donera. Footer links there. */}

      </main>

      <Footer settings={settings} courts={courts} />
    </>
  )
}
