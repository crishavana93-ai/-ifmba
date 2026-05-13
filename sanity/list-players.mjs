// List all players in Sanity — useful when the previous patch script
// didn't match a player (e.g. wrong first-name spelling) so Cris can
// see the actual data and pick the right doc.
//
// Run:
//   cd ~/ifmba/sanity
//   npx sanity exec list-players.mjs --with-user-token
//
// Outputs a table of every player doc with _id, name, nationality, flag.
// Highlights anyone with a Greek flag or nationality so the Albania
// fix is obvious to apply.

import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })

async function main() {
  const players = await client.fetch(
    `*[_type=="player"] | order(number asc){
      _id, firstName, lastName, number, nationality, flag, active
    }`,
  )

  if (!players.length) {
    console.log('No player documents found.')
    return
  }

  console.log(`\n▸ ${players.length} player document(s) in Sanity:\n`)

  const pad = (s, n) => String(s ?? '').padEnd(n, ' ').slice(0, n)
  console.log(
    pad('#', 4),
    pad('First name', 14),
    pad('Last name', 18),
    pad('Nationality', 16),
    pad('Flag', 6),
    pad('Active', 7),
    'ID',
  )
  console.log('-'.repeat(110))

  for (const p of players) {
    const isGreek =
      (p.nationality || '').toLowerCase().startsWith('greek') ||
      (p.nationality || '').toLowerCase().startsWith('grek') ||
      p.flag === '🇬🇷'
    const marker = isGreek ? ' ← GREEK (candidate for Albania fix)' : ''
    console.log(
      pad(p.number, 4),
      pad(p.firstName, 14),
      pad(p.lastName, 18),
      pad(p.nationality, 16),
      pad(p.flag, 6),
      pad(p.active === false ? 'no' : 'yes', 7),
      p._id,
      marker,
    )
  }

  console.log(`\nTo patch a specific player, run:`)
  console.log(`  npx sanity exec patch-nikos-albania.mjs --with-user-token`)
  console.log(`(or edit that script first to match the right firstName / _id)`)
}

main().catch((err) => {
  console.error('✗ Failed:', err)
  process.exit(1)
})
