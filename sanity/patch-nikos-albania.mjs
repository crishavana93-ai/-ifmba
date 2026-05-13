// Patch Nikos's player document — nationality → Albania, flag → 🇦🇱
//
// Run from inside the Sanity Studio project:
//   cd ~/ifmba/sanity
//   npx sanity exec patch-nikos-albania.mjs --with-user-token
//
// Matches by firstName === "Nikos" (case-insensitive). If you have more
// than one Nikos in the roster (good problem to have), the script will
// log all matches and patch them all — guarded by a printed summary so
// you can ctrl-C before it commits.

import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })

async function main() {
  const matches = await client.fetch(
    '*[_type=="player" && lower(firstName) match "nikos*"]{_id, firstName, lastName, nationality, flag}',
  )

  if (!matches.length) {
    console.log('✗ No player found with first name starting "Nikos". Nothing to patch.')
    return
  }

  console.log(`▸ Found ${matches.length} match${matches.length > 1 ? 'es' : ''}:`)
  for (const p of matches) {
    console.log(`   - ${p.firstName} ${p.lastName} · current: ${p.nationality || '(none)'} ${p.flag || ''}`)
  }
  console.log('\n▸ Patching all matches to nationality="Albania", flag="🇦🇱" ...')

  await Promise.all(
    matches.map((p) =>
      client.patch(p._id).set({ nationality: 'Albania', flag: '🇦🇱' }).commit(),
    ),
  )

  console.log('✓ Done. Hard-refresh ifmba.se in ~60s (Next.js ISR window).')
}

main().catch((err) => {
  console.error('✗ Patch failed:', err)
  process.exit(1)
})
