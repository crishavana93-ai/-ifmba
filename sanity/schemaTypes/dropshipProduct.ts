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
      // Transparent-background PNG showing JUST the design / print, with no
      // t-shirt fabric or photo background around it. Used by the on-model
      // RotationViewer on /butik and the MockupGenerator preview so we get
      // a clean composite ("print on the model's chest") instead of having
      // to chroma-key the dark shirt fabric out at render time.
      //
      // How to produce one (cheapest path): drop the AliExpress product photo
      // into https://remove.bg (50 free/month), download the transparent PNG,
      // upload here. Takes ~30 seconds per product.
      name: 'cleanDesign',
      title: 'Clean Design PNG (transparent background)',
      type: 'image',
      options: {hotspot: false, accept: 'image/png'},
      description:
        'Transparent-background PNG of JUST the print/graphic — no fabric, no photo background. ' +
        'Drop the product image into remove.bg → download → upload here. ' +
        'If empty, /butik falls back to algorithmic chroma-key on the Product Photo (lower quality).',
    }),
    defineField({
      name: 'lifestyleImage',
      title: 'On-Model Photo (Optional)',
      type: 'image',
      options: {hotspot: true, accept: 'image/*'},
      description: 'Photo of a real person wearing the product. Shown via a "Wear it" lightbox on the card. Portrait or square works best.',
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
