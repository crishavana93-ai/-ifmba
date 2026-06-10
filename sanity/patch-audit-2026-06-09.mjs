// Patch live Sanity content — audit fixes 2026-06-09
//
// Run from the project root (where .env.local lives):
//   cd ~/ifmba
//   node sanity/patch-audit-2026-06-09.mjs            # dry run (shows what WOULD change)
//   APPLY=1 node sanity/patch-audit-2026-06-09.mjs    # actually write
//
// What it does:
//   1. siteSettings.contactEmail  -> teammba040@gmail.com
//   2. siteSettings hero taglines + about text: "9 nation(er/s)" -> "15"
//   3. Reports player docs whose flag emoji and nationality label disagree
//      (e.g. flag 🇽🇰 + "Albenia", flag 🇦🇱 + "Greece"). It does NOT auto-fix
//      nationalities — only you know each player's true nationality. Fill the
//      PLAYER_FIXES map below with the correct values, then re-run with APPLY=1.
//
// NB: this is the same pattern as patch-nikos-albania.mjs and uses _client.mjs.

import { getWriteClient } from './_client.mjs'

const NEW_EMAIL = 'teammba040@gmail.com'

// ── Fill these in once you've confirmed each player's real nationality. ──
// Key = player _id (run `node sanity/list-players.mjs` to get ids).
// Leave empty {} to only do the email + tagline fixes.
const PLAYER_FIXES_BY_NUMBER = [
  { number: 1,  nationality: 'Kosovo',  flag: '🇽🇰' }, // Hekuran Pireva (was "Albenia" + wrong)
  { number: 34, nationality: 'Albania', flag: '🇦🇱' }, // Anti Zeinelchotza (was labelled "Greece")
  { number: 77, nationality: 'Cuba',    flag: '🇨🇺' }, // Cristian Ortiz Suárez (was "Cuban")
]

function fix9to15(v) {
  if (typeof v !== 'string') return v
  return v
    .replace(/9 nationer/g, '15 nationer')
    .replace(/9 Nationer/g, '15 Nationer')
    .replace(/9 nations/g, '15 nations')
    .replace(/9 NATIONS/g, '15 NATIONS')
}

async function main() {
  const APPLY = process.env.APPLY === '1'
  const client = await getWriteClient()
  console.log(APPLY ? '▸ APPLY mode — writing changes\n' : '▸ DRY RUN — no writes (set APPLY=1 to write)\n')

  // 1 + 2 — siteSettings singleton
  const settings = await client.fetch(
    `*[_type=="siteSettings"][0]{_id, contactEmail, heroTaglineSv, heroTaglineEn, aboutTextSv, aboutTextEn}`,
  )
  if (!settings?._id) {
    console.log('✗ No siteSettings document found.')
  } else {
    const set = {}
    if (settings.contactEmail !== NEW_EMAIL) set.contactEmail = NEW_EMAIL
    for (const f of ['heroTaglineSv', 'heroTaglineEn', 'aboutTextSv', 'aboutTextEn']) {
      const next = fix9to15(settings[f])
      if (next && next !== settings[f]) set[f] = next
    }
    if (Object.keys(set).length === 0) {
      console.log('✓ siteSettings already correct — nothing to change.')
    } else {
      console.log('▸ siteSettings changes:')
      for (const [k, v] of Object.entries(set)) {
        console.log(`   ${k}: ${JSON.stringify(settings[k])} -> ${JSON.stringify(v)}`)
      }
      if (APPLY) {
        await client.patch(settings._id).set(set).commit()
        console.log('   ✓ written')
      }
    }
  }

  // 3 — flag / nationality mismatch report
  console.log('\n▸ Player flag/nationality audit:')
  const players = await client.fetch(
    `*[_type=="player"]{_id, firstName, lastName, number, nationality, flag} | order(number asc)`,
  )
  const FLAG = { '🇸🇪': 'sweden', '🇬🇷': 'greece', '🇦🇷': 'argentina', '🇨🇺': 'cuba',
                 '🇦🇱': 'albania', '🇽🇰': 'kosovo', '🇬🇧': 'uk', '🇳🇬': 'nigeria' }
  for (const p of players) {
    const fl = FLAG[p.flag]
    const nat = (p.nationality || '').toLowerCase()
    const mismatch = fl && nat && !nat.includes(fl) && fl !== 'uk'
    const tag = mismatch ? '  ⚠ FLAG/LABEL MISMATCH' : ''
    console.log(`   #${p.number ?? '?'} ${p.firstName || ''} ${p.lastName || ''} · ${p.flag || '∅'} "${p.nationality || ''}" id=${p._id}${tag}`)
  }

  // 3b — apply confirmed player fixes, matched by jersey number so we catch
  // BOTH the published doc and any draft (drafts.player-N) with the same number.
  if (PLAYER_FIXES_BY_NUMBER.length) {
    console.log('\n▸ Applying roster fixes (by jersey number, incl. drafts):')
    for (const fix of PLAYER_FIXES_BY_NUMBER) {
      const docs = await client.fetch(
        `*[_type=="player" && number == $n]{_id, firstName, lastName, nationality, flag}`,
        { n: fix.number },
      )
      if (!docs.length) { console.log(`   ⚠ no player with #${fix.number} found`); continue }
      for (const d of docs) {
        console.log(`   #${fix.number} ${d.firstName||''} ${d.lastName||''}: ${d.flag||'∅'}"${d.nationality||''}" -> ${fix.flag}"${fix.nationality}"  (${d._id})`)
        if (APPLY) {
          await client.patch(d._id).set({ nationality: fix.nationality, flag: fix.flag }).commit()
          console.log('     ✓ written')
        }
      }
    }
  }

  console.log('\nDone.')
}

main().catch((e) => { console.error(e); process.exit(1) })
