// Add 5 NEW AliExpress products to the /butik catalog.
//
// Captured via Chrome MCP on 2026-05-19 from URLs Cris pasted in chat.
// Each row already has the real product photo URL + accurate AliExpress
// cost in SEK. Retail prices set to give a 200-400% markup, in line with
// existing catalog products. inStock=true so they go live immediately.
//
// Run from project root:
//   cd ~/ifmba
//   node sanity/seed-shop-add-new-2026-05-19.mjs
//
// Safe to re-run — stable _ids based on slug, upserts via createOrReplace.

import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Hardcode the project + dataset so the script works without .env.local
// being fully populated. Only the WRITE TOKEN must come from env (it's the
// only sensitive value).
const SANITY_PROJECT_ID = '3zuy5n8l'
const SANITY_DATASET = 'production'

function loadDotEnv() {
  const here = dirname(fileURLToPath(import.meta.url))
  const candidates = [
    resolve(here, '..', '.env.local'),
    resolve(here, '..', '.env'),
    resolve(process.cwd(), '.env.local'),
  ]
  for (const path of candidates) {
    if (!existsSync(path)) continue
    const text = readFileSync(path, 'utf8')
    for (const raw of text.split('\n')) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq === -1) continue
      const key = line.slice(0, eq).trim()
      let val = line.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    }
    return path
  }
  return null
}

async function getWriteClient() {
  const loadedFrom = loadDotEnv()
  // Prefer either SANITY_API_WRITE_TOKEN or the legacy SANITY_API_TOKEN —
  // some envs use the latter name. Pass --token=sk_... on the CLI to override.
  const cliToken = process.argv.find((a) => a.startsWith('--token='))?.slice(8)
  const token = cliToken || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN
  if (!token) {
    throw new Error(
      'Need a Sanity write token. Get one at https://www.sanity.io/manage → ' +
        'Project (3zuy5n8l) → API → Tokens → "Add API token" (Editor permission). ' +
        'Then run again with:\n  SANITY_API_WRITE_TOKEN=sk_... node sanity/seed-shop-add-new-2026-05-19.mjs\n' +
        'OR pass inline:  node sanity/seed-shop-add-new-2026-05-19.mjs --token=sk_...',
    )
  }
  console.log(`[client] projectId=${SANITY_PROJECT_ID} dataset=${SANITY_DATASET} env=${loadedFrom || '(none)'}\n`)
  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  })
}

const NEW_PRODUCTS = [
  {
    slug: 'kobe-rock-plan-tribute-tee',
    name: 'Kobe · Rock Plan #24 Tribute Tee',
    aliId: '1005010743964745',
    sourceImageUrl: 'https://ae-pic-a1.aliexpress-media.com/kf/Sb9d0575175ea45e3829d8938b4667ccdi.jpg',
    sourceCostSek: 68,
    priceSek: 249,
    compareAtPriceSek: 329,
    descSv: 'Klassisk #24 i guld-Lakers, "The Rock Plan"-signatur. Mamba-tribute oversized tee.',
    descEn: 'Classic #24 in gold Lakers, "The Rock Plan" signature. Mamba tribute oversized tee.',
    tag: 'NEW',
    order: 45,
  },
  {
    slug: 'tupac-y2k-harajuku-tee',
    name: 'Y2K · Tupac Harajuku Vintage Tee',
    aliId: '1005009793959199',
    sourceImageUrl: 'https://ae-pic-a1.aliexpress-media.com/kf/S1b319f7bd13848c480b7ac662028a6b0B.jpg',
    sourceCostSek: 40,
    priceSek: 199,
    compareAtPriceSek: 279,
    descSv: 'Distressed vintage-wash, Y2K hip-hop estetik. Stor grafisk print, lös passform.',
    descEn: 'Distressed vintage wash, Y2K hip-hop aesthetic. Big graphic print, loose fit.',
    tag: 'BESTSELLER',
    order: 50,
  },
  {
    slug: 'kobe-jordan-be-legendary-tee',
    name: 'Kobe & Jordan · Be Legendary Tee',
    aliId: '1005008382484466',
    sourceImageUrl: 'https://ae-pic-a1.aliexpress-media.com/kf/S6779befad4974f4ca2be61ce3b0080f3P.jpg',
    sourceCostSek: 61,
    priceSek: 249,
    compareAtPriceSek: 329,
    descSv: 'Två GOAT:ar på samma plagg. "Be Legendary"-print med signaturer.',
    descEn: 'Two GOATs on one tee. "Be Legendary" print with both signatures.',
    tag: 'LIMITED',
    order: 55,
  },
  {
    slug: 'kobe-free-throw-tee',
    name: 'Kobe · Free Throw Tee (White)',
    aliId: '1005008974365778',
    sourceImageUrl: 'https://ae-pic-a1.aliexpress-media.com/kf/S28b6d4464ba443e4ad640ca410c07331a.jpg',
    sourceCostSek: 71,
    priceSek: 229,
    compareAtPriceSek: 299,
    descSv: 'Kobe vid frikastlinjen, digital direct-spray print. Vit oversized streetwear tee.',
    descEn: 'Kobe at the free-throw line, digital direct-spray print. White oversized streetwear tee.',
    order: 60,
  },
  {
    slug: 'kobe-bubble-gum-pop-y2k-tee',
    name: 'Kobe · Bubble Gum Pop Y2K Tee',
    aliId: '1005009803903333',
    sourceImageUrl: 'https://ae-pic-a1.aliexpress-media.com/kf/S35e3e88fe8be47178902bba56655b1fes.jpg',
    sourceCostSek: 78,
    priceSek: 249,
    compareAtPriceSek: 329,
    descSv: 'Kobe nr 8 från baksidan med gult bollhängande. Y2K-streetwear, harajuku-vibes.',
    descEn: 'Kobe #8 from the back, gold jersey. Y2K streetwear, harajuku vibes.',
    tag: 'NEW',
    order: 65,
  },
]

async function uploadImageFromUrl(client, url, filename) {
  console.log(`  ↓ fetch ${url.slice(-50)}`)
  const res = await fetch(url, {
    headers: {
      // AliExpress CDN returns a 403 unless we send a browser-ish UA
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.aliexpress.com/',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const asset = await client.assets.upload('image', buf, { filename })
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
}

async function main() {
  const client = await getWriteClient()
  console.log(`Adding ${NEW_PRODUCTS.length} new products to /butik\n`)

  for (const p of NEW_PRODUCTS) {
    const _id = `dropshipProduct-${p.slug}`
    console.log(`• ${p.name}  (${_id})`)

    let imageField = null
    try {
      imageField = await uploadImageFromUrl(client, p.sourceImageUrl, `${p.slug}.jpg`)
      console.log(`  ✓ image uploaded → ${imageField.asset._ref}`)
    } catch (err) {
      console.warn(`  ⚠️  image upload failed (${err.message}) — will create doc without image`)
    }

    const doc = {
      _id,
      _type: 'dropshipProduct',
      name: p.name,
      slug: { _type: 'slug', current: p.slug },
      category: 'apparel-tee',
      sourceType: 'aliexpress',
      sourceUrl: `https://www.aliexpress.com/item/${p.aliId}.html`,
      sourceCostSek: p.sourceCostSek,
      priceSek: p.priceSek,
      compareAtPriceSek: p.compareAtPriceSek,
      descriptionSv: p.descSv,
      descriptionEn: p.descEn,
      tag: p.tag || undefined,
      shipsFrom: 'cn',
      inStock: true,
      order: p.order,
      ...(imageField ? { image: imageField } : {}),
    }

    await client.createOrReplace(doc)
    console.log(`  ✓ saved\n`)
  }

  console.log(`Done. View at https://ifmba.se/butik`)
  console.log(`Edit in Sanity Studio: https://ifmba.se/studio/structure/shopProductsButik`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
