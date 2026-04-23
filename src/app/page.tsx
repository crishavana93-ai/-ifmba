import { safeFetch, QUERIES } from '@/lib/sanity'
import Loader from '@/components/Loader'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Countdown from '@/components/Countdown'
import Marquee from '@/components/Marquee'
import StatsBar from '@/components/StatsBar'
import About from '@/components/About'
import News from '@/components/News'
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
  const [players, standings, fixtures, results, courts, sponsors, news, settings] = await Promise.all([
    safeFetch<any[]>(QUERIES.players, []),
    safeFetch<any[]>(QUERIES.standings, []),
    safeFetch<any[]>(QUERIES.fixtures, []),
    safeFetch<any[]>(QUERIES.results, []),
    safeFetch<any[]>(QUERIES.courts, []),
    safeFetch<any[]>(QUERIES.sponsors, []),
    safeFetch<any[]>(QUERIES.news, []),
    safeFetch<any>(QUERIES.settings, null),
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
      <ScrollReveal>
        <News news={news} />
      </ScrollReveal>
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
