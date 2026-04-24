import {defineField, defineType} from 'sanity'

/**
 * SwedenNews — editorial aggregator for Swedish basketball headlines.
 *
 * Third-party news sites (basketbollen.se, FIBA Europe, SBBF) don't expose
 * CORS-friendly feeds we can pull from the browser. Instead, the club admin
 * curates a short list of headlines here in the Studio, with a direct link
 * to each source. The site renders these in tabbed groups on the home page.
 *
 * Tab options (see `source` field):
 *   - sbbf   → Svenska Basketbollförbundet (national federation)
 *   - liga   → Basketligan / Damligan (pro leagues)
 *   - skane  → Skåne basket district (our league)
 *   - fiba   → FIBA Europe international news
 */
export default defineType({
  name: 'swedenNews',
  title: 'Sweden News (curated headlines)',
  type: 'document',
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: r => r.required().max(140),
    }),
    defineField({
      name: 'summary',
      title: 'Summary (1–2 sentences)',
      type: 'text',
      rows: 2,
      validation: r => r.max(320),
    }),
    defineField({
      name: 'source',
      title: 'Source / Tab',
      type: 'string',
      description: 'Which tab this headline appears under on the home page.',
      options: {
        list: [
          {title: 'SBBF · National federation', value: 'sbbf'},
          {title: 'Basketligan / Damligan · Pro leagues', value: 'liga'},
          {title: 'Skåne Basket · Our district', value: 'skane'},
          {title: 'FIBA Europe · International', value: 'fiba'},
        ],
      },
      validation: r => r.required(),
    }),
    defineField({
      name: 'sourceName',
      title: 'Publisher name',
      type: 'string',
      description: 'Shown as a small byline, e.g. "basketbollen.se" or "FIBA Europe".',
    }),
    defineField({
      name: 'url',
      title: 'Link to original article',
      type: 'url',
      validation: r => r.uri({scheme: ['http', 'https']}).required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published date',
      type: 'date',
      description: 'Used for sorting (newest first).',
      validation: r => r.required(),
    }),
    defineField({
      name: 'image',
      title: 'Thumbnail — uploaded image (optional, overrides imageUrl)',
      type: 'image',
      options: {hotspot: true, accept: 'image/*'},
    }),
    defineField({
      name: 'imageUrl',
      title: 'Thumbnail URL (auto-filled from og:image by RSS cron)',
      type: 'url',
      description:
        'Usually set automatically by the RSS ingestion job — scraped from the article\'s OpenGraph tags. Leave blank to fall back to the uploaded image (or no image).',
    }),
    defineField({
      name: 'active',
      title: 'Visible on site',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  orderings: [
    {title: 'Newest first', name: 'dateDesc', by: [{field: 'publishedAt', direction: 'desc'}]},
    {title: 'Source · Date', name: 'sourceDate', by: [{field: 'source', direction: 'asc'}, {field: 'publishedAt', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'headline', source: 'source', date: 'publishedAt', media: 'image', active: 'active'},
    prepare: ({title, source, date, media, active}) => ({
      title: active === false ? `[hidden] ${title}` : title,
      subtitle: `${source || 'uncategorized'} · ${date || ''}`,
      media,
    }),
  },
})
