/**
 * Lightweight client-side i18n.
 *
 * Swedish is the primary language (lang="sv" on the html element, all
 * canonical URLs). English is a soft overlay that swaps UI chrome strings
 * via a React context + dictionary. We don't do URL-prefix routing (/en/…)
 * because the site is Swedish-first and SEO lives on the sv URLs.
 *
 * Usage:
 *   const t = useT()
 *   <button>{t('nav.join')}</button>
 *
 * Sanity-authored content uses *Sv / *En twin fields — the `pickLocale()`
 * helper below returns whichever is available for the current locale.
 *
 * Persistence: the user's choice is stored in localStorage under
 * `mba_lang_v1`. Default is 'sv'.
 */
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react'

export type Lang = 'sv' | 'en'

const STORAGE_KEY = 'mba_lang_v1'

// ─── Dictionary ───────────────────────────────────────────────────────
// Keep keys grouped by surface. Missing English keys fall back to Swedish.
const dict: Record<string, { sv: string; en: string }> = {
  // Navbar
  'nav.news':       { sv: 'Nyheter',      en: 'News' },
  'nav.table':      { sv: 'Tabell',       en: 'Table' },
  'nav.squad':      { sv: 'Trupp',        en: 'Squad' },
  'nav.gallery':    { sv: 'Galleri',      en: 'Gallery' },
  'nav.merch':      { sv: 'Merch',        en: 'Merch' },
  'nav.partners':   { sv: 'Partners',     en: 'Partners' },
  'nav.join':       { sv: 'Join',         en: 'Join' },
  'nav.logoAria':   { sv: 'MBA — till startsidan', en: 'MBA — back to home' },

  // Hero
  'hero.badge':       { sv: 'Säsong', en: 'Season' },
  'hero.joinNow':     { sv: 'Gå med nu',  en: 'Join now' },
  'hero.seeTable':    { sv: 'Se tabellen', en: 'See standings' },
  'hero.scroll':      { sv: 'SCROLL',      en: 'SCROLL' },
  'hero.sub':         {
    sv: 'Inte bara ett lag — en familj, en rörelse, en stad. 8 nationer. 1 tröja. Malmös streetball headquarters.',
    en: 'Not just a team — a family, a movement, a city. 9 nations. 1 jersey. Malmö\u2019s streetball headquarters.',
  },

  // Section labels (the small mono label above each H2)
  'section.identity':   { sv: 'Identitet',         en: 'Identity' },
  'section.photos':     { sv: 'Säsongen i bilder', en: 'Season in photos' },
  'section.highlights': { sv: 'Höjdpunkter',       en: 'Highlights' },
  'section.votes':      { sv: 'Fans röstar',       en: 'Fans vote' },
  'section.tippa':      { sv: 'Tippa',             en: 'Predict' },
  'section.standings':  { sv: 'Seriekalender',     en: 'Standings' },
  'section.family':     { sv: 'Truppen',           en: 'The squad' },
  'section.map':        { sv: 'Malmö basketball map', en: 'Malmö basketball map' },
  'section.news':       { sv: 'Senaste',           en: 'Latest' },
  'section.apparel':    { sv: 'Merch',             en: 'Merch' },
  'section.journey':    { sv: 'Vår resa',          en: 'Our journey' },
  'section.partners':   { sv: 'Partners',          en: 'Partners' },

  // About / Identity
  'about.quote1': { sv: 'Inte bara ett lag.',       en: 'Not just a team.' },
  'about.quote2': { sv: 'En familj. En rörelse.',   en: 'A family. A movement.' },

  // Highlights carousel
  'highlights.title':    { sv: 'Top plays',         en: 'Top plays' },
  'highlights.titleEm':  { sv: 'från planen',       en: 'from the floor' },
  'highlights.empty':    { sv: 'Höjdpunkter laddas upp snart.', en: 'Highlights coming soon.' },
  'highlights.someUp':   { sv: 'klipp uppladdat — fler på väg.', en: 'clips up — more coming.' },
  'highlights.nav.prev': { sv: 'Föregående klipp',  en: 'Previous clip' },
  'highlights.nav.next': { sv: 'Nästa klipp',       en: 'Next clip' },
  'highlights.caption':  { sv: 'Höjdpunkt',         en: 'Highlight' },

  // Sponsor teaser
  'teaser.title1':      { sv: 'Stå där',            en: 'Stand where' },
  'teaser.titleEm':     { sv: 'laget',              en: 'the team' },
  'teaser.title2':      { sv: 'står.',              en: 'stands.' },
  'teaser.body':        {
    sv: 'MBA är Malmös mest internationella basketklubb — 9 nationer, 1 tröja — och vi går in i 2026/27 som nyuppflyttade till Div\u00a02 Skåne Herr. Er logga på matchtröjan, bänksidan, hemsidan och i matchklippen. Paket från 10\u00a0000 kr till 75\u00a0000 kr per tvåårsavtal.',
    en: 'MBA is Malmö\u2019s most international basketball club — 9 nations, 1 jersey — and we enter 2026/27 as newly promoted to Div\u00a02 Skåne Men\u2019s League. Your logo on the jersey, the bench, the homepage and the game clips. Packages from 10,000 SEK to 75,000 SEK per two-year agreement.',
  },
  'teaser.stats.nations':   { sv: 'nationer',          en: 'nations' },
  'teaser.stats.promoted':  { sv: 'uppflyttade 2026/27', en: 'promoted 2026/27' },
  'teaser.stats.packages':  { sv: 'partnerpaket',      en: 'partner packages' },
  'teaser.stats.current':   { sv: 'nuvarande partners', en: 'current partners' },
  'teaser.cta.sponsor':     { sv: 'Bli sponsor — skicka förfrågan →', en: 'Become a sponsor — send an enquiry →' },
  'teaser.cta.play':        { sv: 'Spela för MBA',     en: 'Play for MBA' },

  // Footer
  'foot.subscribe':    { sv: 'din@email.com',          en: 'your@email.com' },
  'foot.send':         { sv: 'SKICKA',                 en: 'SUBMIT' },
  'foot.thanks':       { sv: 'Tack! Du är nu med i MBA-familjen.', en: 'Thanks! You\u2019re part of the MBA family now.' },
  'foot.quick':        { sv: 'Snabblänkar',            en: 'Quick links' },
  'foot.contact':      { sv: 'Kontakt',                en: 'Contact' },
  'foot.halls':        { sv: 'Hallar & planer',        en: 'Courts & venues' },
  'foot.seeAll':       { sv: 'Se alla hallar, scheman & karta →', en: 'See all courts, schedules & map →' },
  'foot.privacy':      { sv: 'Integritetspolicy',      en: 'Privacy policy' },
  'foot.poweredBy':    { sv: 'Powered by Profixio',    en: 'Powered by Profixio' },
  'foot.follow':       { sv: 'Följ oss',               en: 'Follow us' },
  'foot.copyright':    { sv: '© 2026 MBA · Malmö Basket', en: '© 2026 MBA · Malmö Basket' },
  'foot.subscribeBrand': { sv: 'Malmös mest internationella basketfamilj. 9 nationer, 1 tröja. Uppflyttade till Div 2 Skåne Herr 2026/27.',
                           en: 'Malmö\u2019s most international basketball family. 9 nations, 1 jersey. Promoted to Div 2 Skåne Men\u2019s League 2026/27.' },
  'foot.members':      { sv: 'Bli medlem',             en: 'Join the club' },

  // Lang toggle
  'lang.aria': { sv: 'Byt språk', en: 'Switch language' },
}

type I18nCtx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const Ctx = createContext<I18nCtx>({
  lang: 'sv',
  setLang: () => {},
  t: (key: string) => dict[key]?.sv ?? key,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('sv')

  // Read saved preference on mount (client-only).
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'en' || saved === 'sv') setLangState(saved)
    } catch {}
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {}
    // Update <html lang> so screen readers + search engines see the switch.
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l === 'en' ? 'en' : 'sv'
    }
  }, [])

  const t = useCallback(
    (key: string) => {
      const entry = dict[key]
      if (!entry) return key
      return entry[lang] || entry.sv
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useT() {
  return useContext(Ctx).t
}

export function useLang() {
  return useContext(Ctx)
}

/**
 * Pick the right Sanity field for the current locale. Usage:
 *   pickLocale(lang, settings?.heroTaglineSv, settings?.heroTaglineEn)
 */
export function pickLocale(
  lang: Lang,
  sv: string | null | undefined,
  en: string | null | undefined,
): string {
  if (lang === 'en' && en) return en
  return sv || en || ''
}
