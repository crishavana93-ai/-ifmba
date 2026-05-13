// MBA Standings seed — Div 3 Skåne Herr · 2025/26
//
// Run from the project root (where .env.local lives):
//   cd ~/ifmba
//   node sanity/seed-standings-2025-26.mjs
//
// Upserts 8 `standing` documents with MBA at 7-0 (current real record).
// Safe to re-run — every doc has a stable _id and is createOrReplace'd.

import { getWriteClient } from './_client.mjs'

// One row per team. Stable _id = `standing-div3-<slug>` so re-runs upsert.
const ROWS = [
  { team: 'Malmö Basket Amatörer', shortName: 'MBA',  position: 1, wins: 7, losses: 0, points: 14, isUs: true },
  { team: 'Team4Q Div3',           shortName: 'T4Q',  position: 2, wins: 5, losses: 2, points: 10 },
  { team: 'Malmö Ballers',         shortName: 'BAL',  position: 3, wins: 5, losses: 2, points: 10 },
  { team: 'Malbas Motion',         shortName: 'MMO',  position: 4, wins: 4, losses: 3, points: 8  },
  { team: 'Halmstad BC',           shortName: 'HBC',  position: 5, wins: 3, losses: 4, points: 6  },
  { team: 'Helamalmö Basket',      shortName: 'HEL',  position: 6, wins: 2, losses: 5, points: 4  },
  { team: 'Malbas Vit',            shortName: 'MV',   position: 7, wins: 1, losses: 6, points: 2  },
  { team: 'IK Eos Lund HJ',        shortName: 'EOS',  position: 8, wins: 0, losses: 7, points: 0  },
]

function slug(s) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function main() {
  const client = await getWriteClient()
  console.log(`▸ Seeding Div 3 standings ...`)

  for (const row of ROWS) {
    const _id = `standing-div3-${slug(row.team)}`
    await client.createOrReplace({
      _id,
      _type: 'standing',
      series: 'div3',
      isUs: row.isUs || false,
      ...row,
    })
    console.log(
      `  ✓ ${String(row.position).padStart(2, ' ')}. ${row.team.padEnd(28, ' ')} ${row.wins}W-${row.losses}L (${row.points} p)${row.isUs ? ' ← MBA' : ''}`,
    )
  }

  // Also delete any OLD standings docs that don't match our new _id pattern
  // (the source of the lingering 5-0 record). Match div3-series docs whose
  // _id doesn't start with our slug prefix.
  const stale = await client.fetch(
    `*[_type=="standing" && (series == "div3" || !defined(series)) && !(_id in $keep)]{_id, team, wins, losses}`,
    { keep: ROWS.map((r) => `standing-div3-${slug(r.team)}`) },
  )
  if (stale.length) {
    console.log(`\n▸ Deleting ${stale.length} stale standings doc(s):`)
    for (const s of stale) {
      console.log(`   - ${s.team || '(no team)'} (${s.wins ?? '?'}-${s.losses ?? '?'}) · _id=${s._id}`)
      await client.delete(s._id)
    }
  }

  console.log('\n✓ Done. Hard-refresh ifmba.se in ~60s (Next.js ISR window).')
}

main().catch((err) => {
  console.error('✗ Seed failed:', err.message)
  process.exit(1)
})
