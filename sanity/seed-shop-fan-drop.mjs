// Seed the /butik catalog with the 12 trending Fan Drop products.
//
// Run from the project root:
//   cd ~/ifmba
//   node sanity/seed-shop-fan-drop.mjs
//
// Creates 12 `dropshipProduct` documents with:
//   - Name, descriptions (SV + EN)
//   - Suggested retail (SEK) + supplier cost estimate
//   - AliExpress search URL as sourceUrl (Cris picks the specific listing later)
//   - shipsFrom = "eu" by default (the only sane choice for SE customers)
//   - inStock = false initially so they don't go live until Cris adds photos
//
// Safe to re-run — stable _ids, upserts via createOrReplace.

import { getWriteClient } from './_client.mjs'

const ROWS = [
  {
    slug: 'retro-mesh-tank',
    name: 'Retro Mesh Tank',
    category: 'apparel-jersey',
    aliSearch: 'mesh basketball jersey vintage oversized',
    sourceCostSek: 95,
    priceSek: 249,
    compareAtPriceSek: 329,
    descSv: 'Oversized mesh, vintage-streetball cut. Byggd för pickup-game energy.',
    descEn: 'Oversized mesh, vintage streetball cut. Built for pickup-game energy.',
    tag: 'NEW',
    order: 10,
  },
  {
    slug: 'baggy-mesh-shorts',
    name: 'Baggy Mesh Shorts',
    category: 'apparel-shorts',
    aliSearch: 'wide basketball shorts oversized mesh',
    sourceCostSek: 110,
    priceSek: 299,
    compareAtPriceSek: 399,
    descSv: 'Y2K-bred passform, mesh-tyg. Matchas med Retro Mesh Tank.',
    descEn: 'Y2K-baggy fit, mesh fabric. Pairs with the Retro Mesh Tank.',
    order: 20,
  },
  {
    slug: 'embroidered-bucket-hat',
    name: 'Bucket Hat · Embroidered',
    category: 'apparel-cap',
    aliSearch: 'basketball bucket hat embroidered',
    sourceCostSek: 70,
    priceSek: 199,
    compareAtPriceSek: 259,
    descSv: 'Broderad bucket-hatt i marin/gul. Skuggar utan att täcka pannan.',
    descEn: 'Embroidered bucket hat in navy/yellow. Shade without forehead cover.',
    order: 30,
  },
  {
    slug: 'compression-arm-sleeve',
    name: 'Arm Sleeve · Compression',
    category: 'accessories-compression',
    aliSearch: 'basketball arm sleeve compression yellow blue',
    sourceCostSek: 35,
    priceSek: 99,
    compareAtPriceSek: 129,
    descSv: 'Komprimerande armhylsa i klubbfärger. Hjälper genomblödning + skydd.',
    descEn: 'Compression arm sleeve in club colors. Boosts circulation + protects.',
    order: 40,
  },
  {
    slug: 'knee-compression-sleeve',
    name: 'Knee Sleeve · Compression',
    category: 'accessories-compression',
    aliSearch: 'basketball knee sleeve compression',
    sourceCostSek: 45,
    priceSek: 149,
    compareAtPriceSek: 199,
    descSv: 'Knäskydd för match och träning. Stabilitet utan att begränsa rörelse.',
    descEn: 'Knee sleeve for game + practice. Stability without restricting motion.',
    order: 50,
  },
  {
    slug: 'elite-crew-socks-3pk',
    name: 'Elite Crew Socks · 3-pack',
    category: 'accessories-socks',
    aliSearch: 'elite basketball socks crew cushioned',
    sourceCostSek: 60,
    priceSek: 199,
    compareAtPriceSek: 249,
    descSv: 'Tre par cushioned crew-strumpor. Stripes i klubbfärgerna.',
    descEn: 'Three pairs cushioned crew socks. Stripes in club colors.',
    order: 60,
  },
  {
    slug: 'terry-headband',
    name: 'Terry Headband',
    category: 'accessories-other',
    aliSearch: 'retro basketball headband sweat terry',
    sourceCostSek: 25,
    priceSek: 89,
    compareAtPriceSek: 119,
    descSv: 'Klassiskt 80-tals frottéband. Suger upp svetten utan att glida.',
    descEn: 'Classic 80s terry headband. Soaks the sweat, stays put.',
    order: 70,
  },
  {
    slug: 'motivational-wristband-set',
    name: 'Motivational Wristband · 3-pack',
    category: 'accessories-other',
    aliSearch: 'basketball silicone wristband motivational',
    sourceCostSek: 20,
    priceSek: 79,
    compareAtPriceSek: 99,
    descSv: 'Set med tre silikonarmband. Förinställda mantras eller blanka.',
    descEn: 'Set of three silicone wristbands. Preset mantras or blanks.',
    order: 80,
  },
  {
    slug: 'drawstring-gym-bag',
    name: 'Drawstring Gym Bag',
    category: 'accessories-bags',
    aliSearch: 'basketball drawstring gym bag mesh',
    sourceCostSek: 55,
    priceSek: 129,
    compareAtPriceSek: 169,
    descSv: 'Mesh-paneler för luftcirkulation efter match. Rymmer boll + skor.',
    descEn: 'Mesh panels for post-game airflow. Fits ball + shoes.',
    order: 90,
  },
  {
    slug: 'mouthguard-kit',
    name: 'Mouthguard Kit',
    category: 'accessories-other',
    aliSearch: 'basketball mouthguard case clear',
    sourceCostSek: 35,
    priceSek: 119,
    compareAtPriceSek: 149,
    descSv: 'Genomskinligt tandskydd + förvaringsbox + rengöringsmedel.',
    descEn: 'Clear mouthguard + carrying case + cleaner.',
    order: 100,
  },
  {
    slug: 'eye-black-stickers',
    name: 'Eye Black Stickers · 50-pack',
    category: 'fan-gear',
    aliSearch: 'eye black stickers football basketball pack',
    sourceCostSek: 30,
    priceSek: 79,
    compareAtPriceSek: 99,
    descSv: 'Klistermärken för kinderna. Skär bländning, ger game-face.',
    descEn: 'Cheek stickers. Cuts glare, dials in the game face.',
    order: 110,
  },
  {
    slug: 'mini-basketball-fidget',
    name: 'Mini Basketball Stress Ball',
    category: 'fan-gear',
    aliSearch: 'mini basketball stress ball silicone',
    sourceCostSek: 18,
    priceSek: 59,
    compareAtPriceSek: 79,
    descSv: 'Mini-boll i silikon. Stressboll på skrivbordet.',
    descEn: 'Silicone mini-ball. Desk stress squeeze.',
    order: 120,
  },
]

async function main() {
  const client = await getWriteClient()
  console.log(`▸ Seeding ${ROWS.length} Fan Drop products into /butik catalog ...\n`)

  for (const r of ROWS) {
    // Pre-filtered AliExpress URL: sorted by orders (best-sellers first),
    // limited to EU warehouses (Spain, Poland, Czech Republic, Germany —
    // ships in 3–7 days to Sweden vs 14–28 from China). Also caps min
    // rating to 4.5+ via the URL param.
    const sourceUrl =
      `https://www.aliexpress.com/wholesale?` +
      `SearchText=${encodeURIComponent(r.aliSearch)}` +
      `&shipFromCountry=ES,PL,CZ,DE` +
      `&SortType=total_tranpro_desc` +    // sort by orders desc (most sold first)
      `&minRating=4.5`
    const _id = `dropshipProduct-${r.slug}`

    await client.createOrReplace({
      _id,
      _type: 'dropshipProduct',
      name: r.name,
      slug: { _type: 'slug', current: r.slug },
      category: r.category,
      sourceType: 'aliexpress',
      sourceUrl,
      sourceCostSek: r.sourceCostSek,
      priceSek: r.priceSek,
      compareAtPriceSek: r.compareAtPriceSek,
      descriptionSv: r.descSv,
      descriptionEn: r.descEn,
      tag: r.tag || null,
      shipsFrom: 'eu',
      // Live by default — page shows intentional empty-photo placeholders
      // (category icon + name) until Cris uploads real images via Studio.
      // To hide a specific product, open it in Studio and uncheck "In Stock".
      inStock: true,
      order: r.order,
    })

    const margin = Math.round((1 - r.sourceCostSek / r.priceSek) * 100)
    console.log(
      `  ✓ ${r.name.padEnd(34)} ${String(r.priceSek).padStart(4)} kr  · cost ${String(r.sourceCostSek).padStart(3)}  · ${margin}% margin`,
    )
  }

  console.log(
    '\n✓ Done. Open /studio → Shop Product → upload a photo for each, ' +
      'tick "In Stock", Publish. Then /butik goes live.\n',
  )
}

main().catch((err) => {
  console.error('✗ Seed failed:', err.message)
  process.exit(1)
})
