// One-shot: publish "We Are Kofi" as a sponsor using the logo Cris uploaded
// to the Studio assets on 2026-08-09.
//
// What it does:
//   1. Finds the most recent image asset whose filename contains "kofi"
//      (falls back to searching mediaAsset docs titled/captioned "kofi").
//   2. createIfNotExists + patch a sponsor doc (_id: sponsor-wearekofi):
//        name  : We Are Kofi
//        tier  : Bronze        ← change in Studio if they're a bigger tier
//        active: true
//        logo  : the found asset
//
// The sponsor then appears automatically on /partners (tier card + "Våra
// partners" wall) and bumps the homepage teaser count. No deploy needed —
// pages revalidate within 60s.
//
// Run from the project root (needs .env.local with the write token):
//   cd ~/ifmba && node sanity/patch-kofi-sponsor-2026-08-09.mjs

import { getWriteClient } from './_client.mjs'

const client = await getWriteClient()

// ── 1. Locate the uploaded logo asset ─────────────────────────────────
let asset = await client.fetch(
  `*[_type == "sanity.imageAsset" && originalFilename match "*kofi*"]
    | order(_createdAt desc)[0]{ _id, originalFilename, url, _createdAt }`,
)

if (!asset) {
  // Fallback: maybe it was uploaded via the Media tab as a mediaAsset doc.
  const media = await client.fetch(
    `*[_type == "mediaAsset" && (title match "*kofi*" || captionSv match "*kofi*" || captionEn match "*kofi*")]
      | order(_createdAt desc)[0]{ "assetId": image.asset._ref, title }`,
  )
  if (media?.assetId) {
    asset = await client.fetch(
      `*[_id == $id][0]{ _id, originalFilename, url }`,
      { id: media.assetId },
    )
  }
}

if (!asset?._id) {
  console.error(
    '✗ Could not find an uploaded image whose filename or title contains "kofi".\n' +
    '  Check the filename in Studio → Media, or re-upload as "wearekofi.png",\n' +
    '  then run this script again.',
  )
  process.exit(1)
}

console.log(`▸ Using asset: ${asset.originalFilename || asset._id}\n  ${asset.url}`)

// ── 2. Create/refresh the sponsor document ────────────────────────────
const DOC_ID = 'sponsor-wearekofi'

await client.createIfNotExists({
  _id: DOC_ID,
  _type: 'sponsor',
  name: 'We Are Kofi',
  tier: 'Bronze',
  active: true,
})

await client
  .patch(DOC_ID)
  .set({
    name: 'We Are Kofi',
    active: true,
    logo: {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
    },
    // tier intentionally NOT overwritten on re-runs — if Cris bumps them to
    // Gold in Studio, running this again won't demote them.
  })
  .setIfMissing({ tier: 'Bronze' })
  .commit()

const doc = await client.fetch(`*[_id == $id][0]{ name, tier, active, "logoUrl": logo.asset->url }`, { id: DOC_ID })
console.log('✓ Sponsor published:', JSON.stringify(doc, null, 2))
console.log('\n  Shows on /partners (tier card + partner wall) within ~60s.')
console.log('  Change the tier anytime in /studio → Sponsor → We Are Kofi.')
