// Patch live Sanity content — publish the club Swish number.
//
// Run from the project root (where .env.local lives):
//   node sanity/patch-swish-2026-08-02.mjs            # dry run
//   APPLY=1 node sanity/patch-swish-2026-08-02.mjs    # actually write
//
// Sets on the siteSettings singleton:
//   swishNumber  -> 1230661876   (123 066 18 76)
//   swishPayee   -> MBA Malmö Basket   (only if unset or still "IFK …")
//
// This flips /donera (and the homepage Swish band) from the "kommer snart"
// placeholder to the live Swish module. Same pattern as the other patch-*.mjs.

import { getWriteClient } from './_client.mjs'

const NUMBER = '1230661876'
const PAYEE = 'MBA Malmö Basket'

async function main() {
  const APPLY = process.env.APPLY === '1'
  const client = await getWriteClient()
  console.log(APPLY ? '▸ APPLY mode — writing changes\n' : '▸ DRY RUN — no writes (set APPLY=1 to write)\n')

  const settings = await client.fetch(
    `*[_type=="siteSettings"][0]{_id, swishNumber, swishPayee, swishMessage}`,
  )
  if (!settings?._id) {
    console.log('✗ No siteSettings document found.')
    return
  }
  const set = {}
  if (settings.swishNumber !== NUMBER) set.swishNumber = NUMBER
  if (!settings.swishPayee || settings.swishPayee.includes('IFK')) set.swishPayee = PAYEE
  if (Object.keys(set).length === 0) {
    console.log('✓ Swish settings already correct — nothing to change.')
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
  console.log('\nDone.')
}

main().catch((e) => { console.error(e); process.exit(1) })
