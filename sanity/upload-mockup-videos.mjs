// Bulk-upload model videos to Sanity's `mockupVideo` field on each
// dropshipProduct. Reads compressed .mp4 files from a folder, matches them
// to Sanity products by slug + name, uploads each, and patches the product.
//
// Usage (from project root, after compressing videos):
//   cd ~/ifmba
//   node sanity/upload-mockup-videos.mjs --token=sk_sanity_write_token --dir=/Users/cristianortizsuarez/Documents/MBA/compressed-videos
//
// Flags:
//   --token=sk_...   Sanity write token (or set SANITY_API_WRITE_TOKEN env)
//   --dir=...        Folder with compressed .mp4 videos (default ~/Documents/MBA/compressed-videos)
//   --only=slug      Process just one product (test with one before bulk)
//   --dry-run        Match files to products + report sizes, don't upload
//
// Matching strategy: file basename (without .mp4) is the slug.
// E.g. "lebron-james-tee.mp4" → product with slug="lebron-james-tee".
// For products with non-slug names (e.g. "Stef the Chef" stored with that
// literal as the slug), the script also tries name-matching.

import { createClient } from '@sanity/client'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { resolve, basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SANITY_PROJECT_ID = '3zuy5n8l'
const SANITY_DATASET = 'production'

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
  dir: args.find((a) => a.startsWith('--dir='))?.slice(6),
  only: args.find((a) => a.startsWith('--only='))?.slice(7),
  dryRun: args.includes('--dry-run'),
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[·"']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  loadDotEnv()
  const token = flags.token || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN
  const dir = flags.dir || resolve(process.env.HOME || '', 'Documents/MBA/compressed-videos')

  if (!token) {
    throw new Error('Need a Sanity write token: --token=sk_... or env SANITY_API_WRITE_TOKEN')
  }
  if (!existsSync(dir)) {
    throw new Error(`Directory not found: ${dir}`)
  }

  const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  })

  console.log(`[client] project=${SANITY_PROJECT_ID} dataset=${SANITY_DATASET}`)
  console.log(`[dir]   ${dir}`)
  console.log(`[flags] only=${flags.only || 'ALL'} dryRun=${flags.dryRun}\n`)

  // Pull every product so we can match by slug AND by name
  const products = await client.fetch(
    `*[_type=="dropshipProduct"]{_id, name, "slug": slug.current}`,
  )
  console.log(`Sanity catalog has ${products.length} products\n`)

  // Build lookup tables
  const bySlug = new Map(products.map((p) => [p.slug, p]))
  const byNameSlug = new Map(products.map((p) => [slugify(p.name || ''), p]))

  // Scan video files
  const files = readdirSync(dir).filter((f) => f.endsWith('.mp4')).sort()
  console.log(`Found ${files.length} .mp4 files\n`)

  let uploaded = 0, skipped = 0, failed = 0
  for (const f of files) {
    const slug = basename(f, '.mp4')
    if (flags.only && slug !== flags.only) continue
    const filePath = join(dir, f)
    const sizeKb = statSync(filePath).size / 1024
    let product = bySlug.get(slug)
    if (!product) {
      // Try fuzzy match against product names
      product = byNameSlug.get(slug)
    }
    if (!product) {
      console.log(`⊘ ${f} (${sizeKb.toFixed(0)} KB) — NO MATCH in Sanity, skipping`)
      skipped++
      continue
    }

    console.log(`▸ ${product.name}  (${sizeKb.toFixed(0)} KB)`)
    console.log(`  file: ${f}`)
    console.log(`  → ${product._id}`)

    if (flags.dryRun) {
      console.log(`  [dry-run] would upload + patch\n`)
      continue
    }

    try {
      const videoBuf = readFileSync(filePath)
      console.log(`  ↗ uploading…`)
      const asset = await client.assets.upload('file', videoBuf, {
        filename: f,
        contentType: 'video/mp4',
      })
      console.log(`  ✓ asset ${asset._id}`)
      await client
        .patch(product._id)
        .set({
          mockupVideo: {
            _type: 'file',
            asset: { _type: 'reference', _ref: asset._id },
          },
        })
        .commit()
      console.log(`  ✓ patched\n`)
      uploaded++
    } catch (err) {
      console.error(`  ✗ FAILED: ${err.message}\n`)
      failed++
    }
  }

  console.log('─'.repeat(50))
  console.log(`Done. Uploaded: ${uploaded}  Skipped: ${skipped}  Failed: ${failed}`)
  console.log(`\nVisit https://ifmba.se/butik — click any product to see the video.`)
}

main().catch((err) => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
