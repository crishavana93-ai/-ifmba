// MBA Standings seed — Div 3 Skåne Herr · 2025/26 · VÅR (spring) FINAL
//
// Run from the project root (where .env.local lives):
//   cd ~/ifmba
//   node sanity/seed-standings-var-2026.mjs
//
// Replaces the Div 3 table with the SPRING (vår) grundserie final standings —
// MBA won the spring series undefeated 7-0 (+190), which sealed promotion.
// Source: Profixio leagueid17491, category 1176149 (Herr div 3 vår), 2026-06-09.
// Safe to re-run — stable _ids, createOrReplace, and stale-doc cleanup.

import { getWriteClient } from './_client.mjs'

// Spring (vår) final grundserie — Profixio category 1176149.
const ROWS = [
  { team: 'Malmö Basket Amatörer', shortName: 'MBA',  position: 1, wins: 7, losses: 0, points: 14, isUs: true },
  { team: 'Team4Q Div3',           shortName: 'T4Q',  position: 2, wins: 6, losses: 1, points: 12 },
  { team: 'Malmö Ballers',         shortName: 'BAL',  position: 3, wins: 5, losses: 2, points: 10 },
  { team: 'Malbas Motion',         shortName: 'MMO',  position: 4, wins: 4, losses: 3, points: 8  },
  { team: 'Halmstad BC',           shortName: 'HBC',  position: 5, wins: 3, losses: 4, points: 6  },
  { team: 'Helamalmö Basket',      shortName: 'HEL',  position: 6, wins: 2, losses: 5, points: 4  },
  { team: 'Malbas Vit',            shortName: 'MV',   position: 7, wins: 0, losses: 6, points: 0  },
  { team: 'IK Eos Lund HJ',        shortName: 'EOS',  position: 8, wins: 0, losses: 6, points: 0  },
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
  console.log('▸ Seeding Div 3 standings — VÅR (spring) final ...')

  for (const row of ROWS) {
    const _id = `standing-div3-${slug(row.team)}`
    await client.createOrReplace({ _id, _type: 'standing', series: 'div3', isUs: row.isUs || false, ...row })
    console.log(
      `  ✓ ${String(row.position).padStart(2, ' ')}. ${row.team.padEnd(28, ' ')} ${row.wins}W-${row.losses}L (${row.points} p)${row.isUs ? ' ← MBA' : ''}`,
    )
  }

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
