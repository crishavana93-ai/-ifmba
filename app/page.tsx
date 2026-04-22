import { client, QUERIES } from '@/lib/sanity'
import Loader from '@/components/Loader'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Countdown from '@/components/Countdown'
import Marquee from '@/components/Marquee'
import StatsBar from '@/components/StatsBar'
import About from '@/components/About'
import Standings from '@/components/Standings'
import SwishMeter from '@/components/SwishMeter'
import Squad from '@/components/Squad'
import Courts from '@/components/Courts'
import Sponsors from '@/components/Sponsors'
import Spotlight from '@/components/Spotlight'
import JoinCTA from '@/components/JoinCTA'
import Footer from '@/components/Footer'
import ScrollReveal from '@/components/ScrollReveal'
import ScrollProgress from '@/components/ScrollProgress'
import BackToTop from '@/components/BackToTop'

export const revalidate = 60 // ISR: revalidate every 60 seconds

export default async function Home() {
  const [players, standings, fixtures, results, courts, sponsors, settings] = await Promise.all([
    client.fetch(QUERIES.players),
    client.fetch(QUERIES.standings),
    client.fetch(QUERIES.fixtures),
    client.fetch(QUERIES.results),
    client.fetch(QUERIES.courts),
    client.fetch(QUERIES.sponsors),
    client.fetch(QUERIES.settings),
  ])

  return (
    <>
      <Loader />
      <ScrollProgress />
      <BackToTop />
      <Navbar />
      <Hero settings={settings} />
      {settings?.nextMatchDate && (
        <Countdown
          date={settings.nextMatchDate}
          opponent={settings.nextMatchOpponent}
          venue={settings.nextMatchVenue}
        />
      )}
      <Marquee />
      <StatsBar players={players} standings={standings} />
      <About settings={settings} />
      {settings?.spotlightPlayer && <Spotlight settings={settings} />}
      <ScrollReveal>
        <Standings standings={standings} />
      </ScrollReveal>
      <ScrollReveal>
        <SwishMeter fixtures={fixtures} results={results} />
      </ScrollReveal>
      <ScrollReveal>
        <Squad players={players} />
      </ScrollReveal>
      <ScrollReveal>
        <Courts courts={courts} />
      </ScrollReveal>
      <ScrollReveal>
        <Sponsors sponsors={sponsors} />
      </ScrollReveal>
      <JoinCTA />
      <Footer settings={settings} />
    </>
  )
}
