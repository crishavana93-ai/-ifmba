// MBA seed script — fixes for the audit.
// Run from inside the Sanity Studio project:
//   cd ~/ifmba/sanity
//   npx sanity exec seed-audit-fixes.mjs --with-user-token
//
// This uses your Sanity Studio login (no token management needed).
//
// What it does:
//   1. Fix siteSettings.aboutText — remove "Amatörer"
//   2. Set a default nextMatchDate / opponent / venue
//   3. Pick a spotlight player (first active by number)
//   4. Add 3 placeholder news posts
//   5. Add 3 placeholder sponsor rows (Platinum / Gold / Silver, logo-less)
//   6. Add 1 past result + 1 upcoming fixture
//
// Safe to run multiple times — docs are createIfNotExists'd by _id.

import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })

async function main() {
  const dataset = client.config().dataset
  console.log(`▸ Seeding dataset: ${dataset}`)

  // ── 1. Fix siteSettings ─────────────────────────────────────────────
  const settings = await client.fetch(
    '*[_type=="siteSettings"][0]{_id, aboutText, aboutTextSv, aboutTextEn, nextMatchDate, spotlightPlayer}'
  )
  if (!settings?._id) throw new Error('No siteSettings document found.')

  const patchFields = {}

  const cleanAboutSv =
    'MBA är Malmös mest internationella basketlag. 9 nationer, 1 tröja, en oslagen säsong. Grundat 2020 — byggt på gemenskap, disciplin och kärleken till spelet.'
  const cleanAboutEn =
    "MBA is Malmö's most international basketball team. 9 nations, 1 jersey, an undefeated season. Founded in 2020 — built on community, discipline, and love for the game."

  if (!settings.aboutTextSv || /Amatörer/i.test(settings.aboutTextSv)) patchFields.aboutTextSv = cleanAboutSv
  if (!settings.aboutTextEn || /Amatörer/i.test(settings.aboutTextEn)) patchFields.aboutTextEn = cleanAboutEn
  if (settings.aboutText && /Amatörer/i.test(settings.aboutText)) patchFields.aboutText = cleanAboutEn

  if (!settings.nextMatchDate) {
    const d = new Date()
    d.setDate(d.getDate() + 10)
    d.setHours(19, 0, 0, 0)
    patchFields.nextMatchDate = d.toISOString()
    patchFields.nextMatchOpponent = 'Team4Q'
    patchFields.nextMatchVenue = 'Baltiska Hallen, Malmö'
  }

  if (!settings.spotlightPlayer) {
    const players = await client.fetch(
      '*[_type=="player" && active==true] | order(number asc)[0...1]'
    )
    if (players[0]) {
      patchFields.spotlightPlayer = { _type: 'reference', _ref: players[0]._id }
      patchFields.spotlightQuoteSv = `"${players[0].firstName || 'MBA'} är hjärtat av laget — en kapten som leder med exempel."`
    }
  }

  if (Object.keys(patchFields).length) {
    console.log('▸ Patching siteSettings:', Object.keys(patchFields).join(', '))
    await client.patch(settings._id).set(patchFields).commit()
  } else {
    console.log('  siteSettings already clean — skipping')
  }

  // ── 2. News posts (tags must be in enum: Game Day | Transfer | Community | Event | Media) ──
  const para = (text) => ({
    _type: 'block',
    style: 'normal',
    children: [{ _type: 'span', text, marks: [] }],
    markDefs: [],
  })

  const newsPosts = [
    {
      _id: 'news-season-open-2526',
      _type: 'newsPost',
      title: 'Säsong 2025/26 — MBA startar med 5–0',
      slug: { _type: 'slug', current: 'sasong-2025-26-mba-startar-med-5-0' },
      tag: 'Game Day',
      publishedAt: '2026-04-10T10:00:00.000Z',
      body: [
        para('Efter fem omgångar står MBA oslagen med målskillnad +84. Tre raka hemmasegrar och två på bortaplan.'),
        para('"9 nationer på planen och en defensiv identitet. Vi spelar för varandra," säger tränare Hekuran Pireva. Nästa match: Team4Q, Baltiska Hallen.'),
      ],
    },
    {
      _id: 'news-9-nationer',
      _type: 'newsPost',
      title: '9 nationer, 1 tröja — MBA välkomnar Kuba',
      slug: { _type: 'slug', current: '9-nationer-en-troja' },
      tag: 'Community',
      publishedAt: '2026-04-05T09:00:00.000Z',
      body: [
        para('Truppen växer med en nionde nationalitet. Från Havanna till Malmö — familjen MBA fortsätter att expandera.'),
        para('MBA är nu officiellt representerat av spelare från nio länder.'),
      ],
    },
    {
      _id: 'news-sponsor-call',
      _type: 'newsPost',
      title: 'MBA söker sina första grundpartners',
      slug: { _type: 'slug', current: 'partners-grundpartners' },
      tag: 'Media',
      publishedAt: '2026-04-01T08:00:00.000Z',
      body: [
        para('Vi söker 4 partners för säsong 2025/26. Från 3 000 kr (Brons) till 25 000 kr (Platinum) — paket skräddarsys.'),
        para('Kontakt: teammba040@gmail.com. Vi återkommer inom 48 timmar med en prospect deck.'),
      ],
    },
  ]

  for (const doc of newsPosts) {
    await client.createIfNotExists(doc)
    console.log(`  news  ✓ ${doc.title}`)
  }

  // ── 3. Matches (schema: opponent, home, played, scoreUs, scoreThem, venue) ──
  const matches = [
    {
      _id: 'match-result-halmstad',
      _type: 'match',
      date: '2026-04-12T18:00:00.000Z',
      opponent: 'Halmstad BC',
      home: true,
      venue: 'Baltiska Hallen, Malmö',
      played: true,
      scoreUs: 82,
      scoreThem: 65,
    },
    {
      _id: 'match-fixture-team4q',
      _type: 'match',
      date: patchFields.nextMatchDate || new Date(Date.now() + 10 * 86400_000).toISOString(),
      opponent: 'Team4Q',
      home: true,
      venue: 'Baltiska Hallen, Malmö',
      played: false,
    },
  ]

  for (const doc of matches) {
    await client.createIfNotExists(doc)
    console.log(`  match ✓ MBA vs ${doc.opponent} (${doc.played ? 'result' : 'fixture'})`)
  }

  // ── 4. Sponsor placeholders (tier must be: Platinum | Gold | Silver | Bronze) ──
  const sponsors = [
    { _id: 'sponsor-platinum-available', _type: 'sponsor', name: 'Platinum — plats tillgänglig', tier: 'Platinum', website: 'mailto:teammba040@gmail.com?subject=MBA%20Platinum', active: false },
    { _id: 'sponsor-gold-available',     _type: 'sponsor', name: 'Guld — plats tillgänglig',     tier: 'Gold',     website: 'mailto:teammba040@gmail.com?subject=MBA%20Gold',     active: false },
    { _id: 'sponsor-silver-available',   _type: 'sponsor', name: 'Silver — plats tillgänglig',   tier: 'Silver',   website: 'mailto:teammba040@gmail.com?subject=MBA%20Silver',   active: false },
  ]

  for (const doc of sponsors) {
    await client.createIfNotExists(doc)
    console.log(`  sponsor ✓ ${doc.name}`)
  }

  console.log('\n✓ Seed complete.')
}

main().catch((err) => {
  console.error('✗ Seed failed:', err)
  process.exit(1)
})
