// Seed the 2026/27 Div 2 Skåne Herr schedule as `match` documents + set the
// next-match fields in siteSettings.
//
// Source: Profixio — Herr div 2, Säsongen 26/27, Skånes BDF (leagueid27739),
// MBA team page (teams/1589295), scraped 2026-08-23. 15 of MBA's fixtures
// were booked at that time; round 8 (away vs Purple Panthers) and rounds 17+
// were not yet published — re-run a scrape later and add them in Studio.
//
// NOTE: Round 7 (LTH Griffins away) shows 01:00 on Profixio — clearly a
// placeholder time. Seeded as-is; correct it in Studio when the real tip-off
// is booked.
//
// Deterministic _ids (match-2026-27-r<round>) → re-running the script updates
// rather than duplicates. Scores/played are only set on create, so re-running
// after results are entered won't wipe them.
//
// Run from the project root (needs .env.local with the write token):
//   cd ~/ifmba && node sanity/seed-fixtures-2026-27.mjs

import { getWriteClient } from './_client.mjs'

const client = await getWriteClient()

const LATIN = 'Latinskolans sporthall, Malmö'

const FIXTURES = [
  { round: 1,  date: '2026-09-20T18:30:00+02:00', opponent: 'IF Alexander den Store',      home: false, venue: 'GA-hallen, Helsingborg' },
  { round: 2,  date: '2026-09-26T13:30:00+02:00', opponent: 'Trelleborg Captains',          home: true,  venue: LATIN },
  { round: 3,  date: '2026-10-04T14:30:00+02:00', opponent: 'ÄLI Basket',                   home: false, venue: 'Rönnehallen stora, Ängelholm' },
  { round: 4,  date: '2026-10-17T13:30:00+02:00', opponent: 'IK Eos Lund HUtv.',            home: true,  venue: LATIN },
  { round: 5,  date: '2026-10-25T12:00:00+01:00', opponent: 'Team4Q',                       home: false, venue: 'GA-hallen, Helsingborg' },
  { round: 6,  date: '2026-10-31T13:30:00+01:00', opponent: 'Purple Panthers Basket Herr',  home: true,  venue: LATIN },
  { round: 7,  date: '2026-11-06T01:00:00+01:00', opponent: 'LTH Griffins',                 home: false, venue: 'ISLK-hallen, Lund' }, // time TBC on Profixio
  { round: 10, date: '2026-11-13T19:00:00+01:00', opponent: 'Lobas',                        home: false, venue: 'Pilängshallen, Lomma' },
  { round: 9,  date: '2026-12-05T13:30:00+01:00', opponent: 'Malmö Ballers',                home: true,  venue: LATIN },
  { round: 11, date: '2026-12-19T13:30:00+01:00', opponent: 'IFK Malmö Basket',             home: true,  venue: LATIN },
  { round: 12, date: '2027-01-09T13:30:00+01:00', opponent: 'IF Alexander den Store',       home: true,  venue: LATIN },
  { round: 13, date: '2027-01-17T15:00:00+01:00', opponent: 'Trelleborg Captains',          home: false, venue: 'Västervångshallen, Trelleborg' },
  { round: 14, date: '2027-01-23T13:30:00+01:00', opponent: 'ÄLI Basket',                   home: true,  venue: LATIN },
  { round: 15, date: '2027-01-30T17:30:00+01:00', opponent: 'IK Eos Lund HUtv.',            home: false, venue: 'Eoshallen A, Lund' },
  { round: 16, date: '2027-02-06T13:30:00+01:00', opponent: 'Team4Q',                       home: true,  venue: LATIN },
]

console.log(`▸ Seeding ${FIXTURES.length} fixtures (Div 2 Skåne Herr 26/27)…`)

for (const f of FIXTURES) {
  const _id = `match-2026-27-r${f.round}`
  // Create with played:false if new; on existing docs only refresh the
  // schedule fields (date/opponent/home/venue) and leave results alone.
  await client.createIfNotExists({
    _id,
    _type: 'match',
    date: f.date,
    opponent: f.opponent,
    home: f.home,
    venue: f.venue,
    played: false,
  })
  await client
    .patch(_id)
    .set({ date: f.date, opponent: f.opponent, home: f.home, venue: f.venue })
    .commit()
  console.log(`  ✓ R${String(f.round).padStart(2)} ${f.date.slice(0, 16)}  ${f.home ? 'MBA vs ' + f.opponent : f.opponent + ' vs MBA'}`)
}

// ── Next match → siteSettings (drives any countdown/next-match UI) ──────
const upcoming = [...FIXTURES].sort((a, b) => a.date.localeCompare(b.date))[0]
const settingsId = (await client.fetch(`*[_type == "siteSettings"][0]._id`)) || 'siteSettings'
await client
  .patch(settingsId)
  .set({
    nextMatchDate: upcoming.date,
    nextMatchOpponent: upcoming.opponent,
    nextMatchVenue: `${upcoming.venue}${upcoming.home ? '' : ' (borta)'}`,
  })
  .commit()

console.log(`\n✓ siteSettings updated — next match: ${upcoming.opponent}, ${upcoming.date}`)
console.log('  Missing from Profixio at seed time: round 8 + rounds 17+. Add them in /studio when booked.')
