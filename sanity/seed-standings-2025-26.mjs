// MBA Standings seed — Div 3 Skåne Herr · 2025/26
//
// Run from inside the Sanity Studio project:
//   cd ~/ifmba/sanity
//   npx sanity exec seed-standings-2025-26.mjs --with-user-token
//
// What it does:
//   - Upserts 8 `standing` documents for Div 3 Skåne Herr 2025/26
//   - MBA is set to 7-0 (current actual record, top of table)
//   - Other teams are seeded with internally-consistent records so the
//     table reads as a real mid-season snapshot, not random numbers.
//
// Safe to run multiple times — every doc has a stable _id and is
// createOrReplace'd. To overwrite with even fresher real numbers later,
// just edit the ROWS array below and re-run.
//
// To wipe all standings instead and start from scratch, run:
//   npx sanity documents delete '*[_type=="standing"]'

import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })

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
  const dataset = client.config().dataset
  console.log(`▸ Seeding Div 3 standings into dataset: ${dataset}`)

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

  console.log('\n✓ Done. Hard-refresh ifmba.se in ~60s (Next.js ISR window).')
}

main().catch((err) => {
  console.error('✗ Seed failed:', err)
  process.exit(1)
})
