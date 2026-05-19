// Batch-process all dropshipProduct entries via remove.bg AI segmentation.
//
// For each product:
//   1. Fetch the existing `image` (AliExpress product photo)
//   2. Call remove.bg API with the user's paid plan API key
//   3. Upload the AI-cleaned transparent PNG to Sanity assets
//   4. Patch the product's `cleanDesign` field with the new asset
//
// Why this exists: the server-side chroma-key heuristic at /api/mockup
// cannot tell dark print pixels from dark shirt fabric. remove.bg uses
// a trained segmentation model that correctly identifies "the design"
// vs "the photo background" on every product. Cost on the paid plan is
// ~$0.20/image — under $3 to process the whole catalog.
//
// Usage (from project root):
//   cd ~/ifmba
//   REMOVEBG_API_KEY=your_key node sanity/process-designs-removebg.mjs --token=sk_sanity_write_token
//
// Get your remove.bg API key: https://www.remove.bg/api → Dashboard → API Keys
// Get a Sanity write token: https://www.sanity.io/manage → project 3zuy5n8l → API → Tokens
//
// Flags:
//   --token=sk_... (or env SANITY_API_WRITE_TOKEN)  Sanity write token
//   --only=slug-name                                Process just one product
//   --force                                         Overwrite existing cleanDesign
//   --dry-run                                       Print what would happen, don't change anything
//
// Safe to re-run — by default skips products that already have a cleanDesign.

import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SANITY_PROJECT_ID = '3zuy5n8l'
const SANITY_DATASET = 'production'
const REMOVEBG_API_URL = 'https://api.remove.bg/v1.0/removebg'

function loadDotEnv() {
  const here = dirname(fileURLToPath(import.meta.url))
  const candidates = [
    resolve(here, '..', '.env.local'),
    resolve(here, '..', '.env'),
    resolve(process.cwd(), '.env.local'),
  ]
  for (const p of candidates) {
    if (!existsSync(p)) continue
    const text = readFileSync(p, 'utf8')
    for (const raw of text.split('\n')) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq === -1) continue
      const k = line.slice(0, eq).trim()
      let v = line.slice(eq + 1).trim()
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1)
      }
      if (!process.env[k]) process.env[k] = v
    }
    return p
  }
  return null
}

const args = process.argv.slice(2)
const flags = {
  token: args.find((a) => a.startsWith('--token='))?.slice(8),
  only: args.find((a) => a.startsWith('--only='))?.slice(7),
  force: args.includes('--force'),
  dryRun: args.includes('--dry-run'),
}

async function main() {
  const envLoaded = loadDotEnv()
  const sanityToken = flags.token || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN
  const removebgKey = process.env.REMOVEBG_API_KEY

  if (!sanityToken) {
    throw new Error(
      'Need a Sanity write token. Add SANITY_API_WRITE_TOKEN=sk_... to ~/ifmba/.env.local ' +
        'OR pass --token=sk_... inline.',
    )
  }
  if (!removebgKey) {
    throw new Error(
      'Need a remove.bg API key. Get one at https://www.remove.bg/api → Dashboard. ' +
        'Then add REMOVEBG_API_KEY=... to ~/ifmba/.env.local or pass inline as env var.',
    )
  }

  const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: '2024-01-01',
    token: sanityToken,
    useCdn: false,
  })

  console.log(`[client] project=${SANITY_PROJECT_ID} dataset=${SANITY_DATASET} env=${envLoaded || '(none)'}`)
  console.log(`[flags] only=${flags.only || 'ALL'}  force=${flags.force}  dryRun=${flags.dryRun}\n`)

  // Query all in-stock products. If --only is set, filter to that slug.
  let groq = `*[_type=="dropshipProduct" && inStock == true]{
    _id, name, "slug": slug.current,
    "imageUrl": image.asset->url,
    "hasCleanDesign": defined(cleanDesign)
  }`
  if (flags.only) {
    groq = `*[_type=="dropshipProduct" && slug.current=="${flags.only}"]{
      _id, name, "slug": slug.current,
      "imageUrl": image.asset->url,
      "hasCleanDesign": defined(cleanDesign)
    }`
  }
  const products = await client.fetch(groq)
  console.log(`Found ${products.length} product(s) in catalog\n`)

  let processed = 0, skipped = 0, failed = 0
  for (const p of products) {
    const tag = `${p.name} (${p.slug})`
    if (!p.imageUrl) {
      console.log(`⊘ ${tag} — no image, skipping`)
      skipped++
      continue
    }
    if (p.hasCleanDesign && !flags.force) {
      console.log(`✓ ${tag} — already has cleanDesign (--force to overwrite)`)
      skipped++
      continue
    }

    console.log(`▸ ${tag}`)
    console.log(`  source: ${p.imageUrl.slice(-60)}`)

    if (flags.dryRun) {
      console.log(`  [dry-run] would call remove.bg + upload\n`)
      continue
    }

    try {
      // Call remove.bg with the image URL (no need to download/re-upload)
      console.log(`  ↗ remove.bg processing…`)
      const formData = new FormData()
      formData.append('image_url', p.imageUrl)
      formData.append('size', 'auto')
      formData.append('format', 'png')
      const rbgRes = await fetch(REMOVEBG_API_URL, {
        method: 'POST',
        headers: { 'X-Api-Key': removebgKey },
        body: formData,
      })
      if (!rbgRes.ok) {
        const errText = await rbgRes.text()
        throw new Error(`remove.bg HTTP ${rbgRes.status}: ${errText.slice(0, 200)}`)
      }
      const cleanedPng = Buffer.from(await rbgRes.arrayBuffer())
      console.log(`  ✓ removed bg (${(cleanedPng.length / 1024).toFixed(1)} KB)`)

      // Upload to Sanity assets
      console.log(`  ↗ uploading to Sanity…`)
      const asset = await client.assets.upload('image', cleanedPng, {
        filename: `${p.slug}-clean.png`,
      })
      console.log(`  ✓ uploaded → ${asset._id}`)

      // Patch product to use the new cleanDesign
      await client
        .patch(p._id)
        .set({
          cleanDesign: {
            _type: 'image',
            asset: { _type: 'reference', _ref: asset._id },
          },
        })
        .commit()
      console.log(`  ✓ saved\n`)
      processed++
    } catch (err) {
      console.error(`  ✗ FAILED: ${err.message}\n`)
      failed++
    }
  }

  console.log(`────────────────────────────────────────`)
  console.log(`Done. Processed: ${processed}  Skipped: ${skipped}  Failed: ${failed}`)
  console.log(`View results: https://ifmba.se/butik`)
  console.log(`Edit in Studio: https://ifmba.se/studio/structure/shopProductsButik`)
  if (processed > 0 && !flags.dryRun) {
    console.log(`\nNext: visit https://ifmba.se/butik and rotate any product —`)
    console.log(`every front-view mockup now uses the AI-cleaned design.`)
  }
}

main().catch((err) => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
