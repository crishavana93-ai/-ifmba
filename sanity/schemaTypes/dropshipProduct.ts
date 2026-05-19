/**
 * dropshipProduct — a single product in the MBA Shop catalog.
 *
 * Pattern: the product is sourced from a third-party supplier (AliExpress,
 * Printful, etc.), MBA marks it up and lists it in the /butik catalog.
 * `sourceUrl` is the link Cris uses to manually place the dropship order
 * when a customer buys; eventually this will be auto-forwarded by DSers
 * once we wire up Shopify.
 *
 * For Phase 1 (pre-Shopify), the storefront just lists products with our
 * retail price + a "Reserve" CTA that emails Cris. When Shopify+DSers is
 * live, the same Sanity record drives the Shopify product import too.
 */
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'dropshipProduct',
  title: 'Shop Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      description: 'Customer-facing name. Keep short & punchy.',
      validation: (r) => r.required().max(60),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Auto-generated URL path. Click "Generate" after naming.',
      options: {source: 'name', maxLength: 60},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Apparel — Jersey / Tank', value: 'apparel-jersey'},
          {title: 'Apparel — Shorts', value: 'apparel-shorts'},
          {title: 'Apparel — Hoodie / Sweat', value: 'apparel-hoodie'},
          {title: 'Apparel — Cap / Hat', value: 'apparel-cap'},
          {title: 'Apparel — Tee', value: 'apparel-tee'},
          {title: 'Accessories — Sleeves & Bands', value: 'accessories-compression'},
          {title: 'Accessories — Socks', value: 'accessories-socks'},
          {title: 'Accessories — Bags', value: 'accessories-bags'},
          {title: 'Accessories — Other', value: 'accessories-other'},
          {title: 'Fan Gear — Novelty / Misc', value: 'fan-gear'},
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'sourceType',
      title: 'Source Type',
      type: 'string',
      options: {
        list: [
          {title: 'AliExpress (Fan Drop — generic)', value: 'aliexpress'},
          {title: 'Printful (POD — MBA branded)', value: 'printful'},
          {title: 'Printify (POD — MBA branded)', value: 'printify'},
          {title: 'Direct supplier (Healong / Habit Fit)', value: 'direct'},
          {title: 'Held in club inventory', value: 'inventory'},
        ],
      },
      initialValue: 'aliexpress',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source URL (where Cris places the dropship order)',
      type: 'url',
      description:
        'AliExpress / Printful / supplier link to the actual product. When a customer orders on /butik, this is the link Cris opens to fulfill.',
    }),
    defineField({
      name: 'sourceCostSek',
      title: 'Source Cost (SEK)',
      type: 'number',
      description: 'What MBA pays per unit at the supplier. Used to calculate margin.',
    }),
    defineField({
      name: 'priceSek',
      title: 'Our Retail Price (SEK)',
      type: 'number',
      description: 'What customers see on /butik.',
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'compareAtPriceSek',
      title: 'Compare-at Price (SEK)',
      type: 'number',
      description: 'Optional strikethrough "was" price for urgency. Set 30% higher than `priceSek`.',
    }),
    defineField({
      name: 'image',
      title: 'Product Photo',
      type: 'image',
      options: {hotspot: true, accept: 'image/*'},
      description: 'Square crop preferred (1:1). Use a clean studio shot — no AliExpress watermarks.',
    }),
    defineField({
      // Where the design sits on the front rotation frame (frame 0).
      // Set by the local editor at /butik/admin/mockup when admin drags
      // the design and clicks "Save position". Server compositor reads
      // these values and pixel-renders frame 0 to match the local editor.
      // Frames 1-6 derive their position from FRAME_SPECS perspective
      // offsets relative to these values.
      name: 'designX',
      title: 'Design X position (% of frame width)',
      type: 'number',
      description: 'Chest center horizontal — 0=left edge, 100=right edge, 50=center. Default 50.',
      validation: (r) => r.min(0).max(100),
    }),
    defineField({
      name: 'designY',
      title: 'Design Y position (% of frame height)',
      type: 'number',
      description: 'Chest center vertical — 0=top, 100=bottom. Default 45 (sits on chest, not too high).',
      validation: (r) => r.min(0).max(100),
    }),
    defineField({
      name: 'designWidth',
      title: 'Design Width (% of frame width)',
      type: 'number',
      description: 'How wide the print appears. 25-35 is a real chest-print scale on a tee. Default 30.',
      validation: (r) => r.min(5).max(80),
    }),
    defineField({
      // Transparent-background PNG showing JUST the design / print, with no
      // t-shirt fabric or photo background around it. Used by the on-model
      // RotationViewer on /butik and the MockupGenerator preview so we get
      // a clean composite ("print on the model's chest") instead of having
      // to chroma-key the dark shirt fabric out at render time.
      //
      // How to produce one (cheapest path): drop the AliExpress product photo
      // into https://remove.bg (50 free/month), download the transparent PNG,
      // upload here. Takes ~30 seconds per product.
      //
      // VERIFY: after uploading, the thumbnail should show a grey/white
      // CHECKERED pattern behind the print (that's how Sanity displays
      // transparency). If you see solid white or a full t-shirt outline,
      // the PNG isn't actually transparent — re-run through remove.bg.
      name: 'cleanDesign',
      title: 'Clean Design PNG (transparent background)',
      type: 'image',
      options: {hotspot: false, accept: 'image/png'},
      description:
        '⚠ Must be a TRANSPARENT PNG. After upload, look for a CHECKERED ' +
        'pattern in the preview — that means transparency is working. ' +
        'If you see a black t-shirt or solid background, the file is wrong. ' +
        'Fix: upload to https://remove.bg, download the result, upload here. ' +
        'If left empty, /butik falls back to algorithmic chroma-key on the ' +
        'Product Photo (often leaves a dark halo around the print).',
    }),
    defineField({
      name: 'lifestyleImage',
      title: 'On-Model Photo (Optional)',
      type: 'image',
      options: {hotspot: true, accept: 'image/*'},
      description: 'Photo of a real person wearing the product. Shown via a "Wear it" lightbox on the card. Portrait or square works best.',
    }),
    defineField({
      // Real video of the model wearing THIS specific shirt — replaces the
      // /api/mockup compositor approach for products that have one. When
      // present, /butik plays the video on loop instead of the rotation
      // viewer. Cleanest possible mockup: actual model + actual product,
      // no AI compositing artifacts.
      //
      // Filming spec: 10-15 sec, model facing camera, slow turn so all
      // angles are visible, neutral white background. iPhone vertical
      // 1080×1920 or 540×960 is plenty for the viewer (~400px wide).
      // Save as MP4 (H.264) for cross-browser support.
      name: 'mockupVideo',
      title: 'Model Video (Real Shirt)',
      type: 'file',
      options: {accept: 'video/mp4,video/webm'},
      description:
        'Short video (10-15s) of the model wearing this exact shirt. Replaces ' +
        'the compositor on /butik when present. iPhone vertical MP4 is fine. ' +
        'File: ~/Documents/MBA/tshirt-references/{nn}-{slug}.mp4 after filming.',
    }),
    defineField({
      name: 'lifestyleImageUrl',
      title: 'On-Model Photo URL (Alternative)',
      type: 'url',
      description: 'Use this if the photo is already hosted (e.g. /lifestyle/model-mba-tee.webp on the public folder). Overrides the upload above.',
    }),
    defineField({
      name: 'descriptionSv',
      title: 'Description (Swedish)',
      type: 'text',
      rows: 3,
      description: '2–3 short lines. Vad, känsla, leveranslöfte.',
    }),
    defineField({
      name: 'descriptionEn',
      title: 'Description (English)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'tag',
      title: 'Tag (e.g. "NEW", "BESTSELLER", "LIMITED")',
      type: 'string',
      description: 'Optional ribbon shown on the card. Leave empty for none.',
    }),
    defineField({
      name: 'shipsFrom',
      title: 'Ships From',
      type: 'string',
      options: {
        list: [
          {title: '🇪🇺 EU warehouse (3–7 days to SE)', value: 'eu'},
          {title: '🇨🇳 China (14–28 days)', value: 'cn'},
          {title: '🇸🇪 Held in Sweden (1–3 days)', value: 'se'},
          {title: '🇺🇸 US warehouse (10–14 days)', value: 'us'},
        ],
      },
      initialValue: 'eu',
    }),
    defineField({
      name: 'inStock',
      title: 'In Stock / Active',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck to hide from /butik without deleting the doc.',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first in the catalog.',
      initialValue: 100,
    }),
  ],
  orderings: [
    {title: 'Display Order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
    {title: 'Newest', name: 'newest', by: [{field: '_createdAt', direction: 'desc'}]},
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'priceSek',
      media: 'image',
      stock: 'inStock',
    },
    prepare: ({title, subtitle, media, stock}) => ({
      title: `${stock === false ? '⊘ ' : ''}${title}`,
      subtitle: `${subtitle ?? '?'} kr`,
      media,
    }),
  },
})
