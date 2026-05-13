// Patch the "Nikos" player document → nationality: Albania, flag: 🇦🇱
//
// Run from the project root (where .env.local lives):
//   cd ~/ifmba
//   node sanity/patch-nikos-albania.mjs
//
// MATCH STRATEGY (in order):
//   1. If env var TARGET_ID is set, patch only that doc (safest).
//        TARGET_ID=player-abc123 node sanity/patch-nikos-albania.mjs
//   2. firstName starts with "Nikos" / "Niko" / "Nick" (case-insensitive)
//   3. Players whose current nationality is "Greek/Grekland" / flag 🇬🇷
//
// If multiple candidates are found, the script lists them and exits
// without patching — re-run with TARGET_ID to pick the exact one.

import { getWriteClient } from './_client.mjs'

async function main() {
  const client = await getWriteClient()
  const targetId = process.env.TARGET_ID

  let matches
  if (targetId) {
    matches = await client.fetch(
      `*[_type=="player" && _id == $id]{_id, firstName, lastName, nationality, flag}`,
      { id: targetId },
    )
    if (!matches.length) {
      console.log(`✗ No player with _id=${targetId}.`)
      return
    }
  } else {
    matches = await client.fetch(
      `*[_type=="player" && (
        lower(firstName) match "nikos*" ||
        lower(firstName) match "niko*" ||
        lower(firstName) match "nick*" ||
        lower(nationality) match "greek*" ||
        lower(nationality) match "grek*" ||
        flag == "🇬🇷"
      )]{_id, firstName, lastName, nationality, flag}`,
    )
  }

  if (!matches.length) {
    console.log(
      '✗ No matching player found. Run `node sanity/list-players.mjs` first ' +
        'to see all players and pick a TARGET_ID.',
    )
    return
  }

  console.log(`▸ Found ${matches.length} candidate${matches.length > 1 ? 's' : ''}:`)
  for (const p of matches) {
    console.log(
      `   - ${p.firstName || '(no first)'} ${p.lastName || ''}` +
        `  ·  current: ${p.nationality || '(none)'} ${p.flag || ''}` +
        `  ·  _id=${p._id}`,
    )
  }

  if (matches.length > 1 && !targetId) {
    console.log(
      '\n⚠ Multiple candidates — refusing to patch all of them automatically.',
    )
    console.log('   Re-run with TARGET_ID set to the exact _id, e.g.:')
    console.log(`     TARGET_ID=${matches[0]._id} node sanity/patch-nikos-albania.mjs`)
    return
  }

  console.log('\n▸ Patching to nationality="Albania", flag="🇦🇱" ...')
  await Promise.all(
    matches.map((p) =>
      client.patch(p._id).set({ nationality: 'Albania', flag: '🇦🇱' }).commit(),
    ),
  )
  console.log('✓ Done. Hard-refresh ifmba.se in ~60s (Next.js ISR window).')
}

main().catch((err) => {
  console.error('✗ Patch failed:', err.message)
  process.exit(1)
})
