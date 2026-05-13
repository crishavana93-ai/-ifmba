// List all players in Sanity — useful when the patch-nikos script didn't
// match the right player so you can see the actual data and pick a doc ID.
//
// Run from the project root (where .env.local lives):
//   cd ~/ifmba
//   node sanity/list-players.mjs
//
// No Sanity CLI needed. Reads projectId + token from .env.local.

import { getReadClient } from './_client.mjs'

async function main() {
  const client = await getReadClient()
  const players = await client.fetch(
    `*[_type=="player"] | order(number asc){
      _id, firstName, lastName, number, nationality, flag, active
    }`,
  )

  if (!players.length) {
    console.log('No player documents found.')
    return
  }

  console.log(`▸ ${players.length} player document(s) in Sanity:\n`)

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

  console.log(`\nTo patch a specific player:`)
  console.log(`  TARGET_ID=<id> node sanity/patch-nikos-albania.mjs`)
}

main().catch((err) => {
  console.error('✗ Failed:', err.message)
  process.exit(1)
})
