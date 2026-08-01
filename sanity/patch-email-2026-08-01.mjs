// Patch live Sanity content — switch club emails to the ifmba.se domain.
//
// Run from the project root (where .env.local lives):
//   node sanity/patch-email-2026-08-01.mjs            # dry run
//   APPLY=1 node sanity/patch-email-2026-08-01.mjs    # actually write
//
// What it does:
//   1. siteSettings.contactEmail      -> info@ifmba.se
//   2. siteSettings.gearContactEmail  -> info@ifmba.se
//      (both only when unset or still pointing at the old teammba040 Gmail —
//       a custom value someone typed in Studio is left alone)
//   3. Placeholder sponsor docs (sponsor-*-available) whose `website` is a
//      mailto: to the old Gmail -> mailto:sponsorship@ifmba.se (same subject)
//   4. Lists ALL sponsor docs so you can see whether KOFI / Turquino Studios
//      exist as sponsor entries (the /partners "Tack till" wall renders them).
//
// Same pattern as patch-audit-2026-06-09.mjs; uses _client.mjs for the token.

import { getWriteClient } from './_client.mjs'

const OLD = 'teammba040@gmail.com'
const INFO = 'info@ifmba.se'
const SPONSORSHIP = 'sponsorship@ifmba.se'

const isStale = (v) => !v || v.includes(OLD)

async function main() {
  const APPLY = process.env.APPLY === '1'
  const client = await getWriteClient()
  console.log(APPLY ? '▸ APPLY mode — writing changes\n' : '▸ DRY RUN — no writes (set APPLY=1 to write)\n')

  // 1 + 2 — siteSettings singleton
  const settings = await client.fetch(
    `*[_type=="siteSettings"][0]{_id, contactEmail, gearContactEmail}`,
  )
  if (!settings?._id) {
    console.log('✗ No siteSettings document found.')
  } else {
    const set = {}
    if (isStale(settings.contactEmail)) set.contactEmail = INFO
    if (isStale(settings.gearContactEmail)) set.gearContactEmail = INFO
    if (Object.keys(set).length === 0) {
      console.log('✓ siteSettings emails already custom/correct — nothing to change.')
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

  // 3 — placeholder sponsor docs with old mailto links
  const sponsors = await client.fetch(
    `*[_type=="sponsor"]{_id, name, tier, active, website} | order(tier asc)`,
  )
  console.log('\n▸ Sponsor docs with old mailto links:')
  let touched = 0
  for (const sp of sponsors) {
    if (sp.website && sp.website.startsWith('mailto:') && sp.website.includes(OLD)) {
      const next = sp.website.replaceAll(OLD, SPONSORSHIP)
      console.log(`   ${sp._id}: ${sp.website} -> ${next}`)
      touched++
      if (APPLY) {
        await client.patch(sp._id).set({ website: next }).commit()
        console.log('     ✓ written')
      }
    }
  }
  if (!touched) console.log('   (none)')

  // 4 — full sponsor inventory
  console.log('\n▸ All sponsor docs (does the wall include KOFI + Turquino Studios?):')
  if (!sponsors.length) console.log('   (no sponsor docs at all)')
  for (const sp of sponsors) {
    console.log(`   [${sp.active ? 'active' : 'inactive'}] ${sp.tier ?? '?'} — ${sp.name}  (${sp._id})  ${sp.website ?? ''}`)
  }

  console.log('\nDone.')
}

main().catch((e) => { console.error(e); process.exit(1) })
