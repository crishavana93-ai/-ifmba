import {defineField, defineType} from 'sanity'

/**
 * MediaAsset — unified schema for ALL uploadable photos + videos in Sanity Studio.
 *
 * Why one schema for both: gives you a single "Media" tab in the Studio where the club
 * can drag-drop images or .mp4s, tag them with a category, and the live site reads them
 * by category (team / fans / gameday / matchday-reel / news / player / merch).
 *
 * - `kind` = photo | video — tells the front-end which renderer to use
 * - `category` = where it shows up on the site (Media Wall tabs, hero reel, news)
 * - `image` is used when kind = photo
 * - `video` (Sanity file asset, accept mp4/webm/mov) is used when kind = video
 * - `placement` lets you pin an asset to a specific slot (e.g. "match-day promo video"),
 *    so the site can query it directly instead of just "any gameday video"
 */
export default defineType({
  name: 'mediaAsset',
  title: 'Media · Photos & Videos',
  type: 'document',
  fields: [
    defineField({
      name: 'kind',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          {title: 'Photo', value: 'photo'},
          {title: 'Video', value: 'video'},
        ],
        layout: 'radio',
      },
      initialValue: 'photo',
      validation: r => r.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Where this asset appears on the website.',
      options: {
        list: [
          {title: 'Team (Media Wall)', value: 'team'},
          {title: 'Fans (Media Wall)', value: 'fans'},
          {title: 'Game Day (Media Wall)', value: 'gameday'},
          {title: 'Match-Day Reel (Tip-off video)', value: 'matchday-reel'},
          {title: 'Hero / Family photo', value: 'hero'},
          {title: 'News post cover', value: 'news'},
          {title: 'Player portrait', value: 'player'},
          {title: 'Merch / Apparel', value: 'merch'},
          {title: 'Court photo', value: 'court'},
          {title: 'Sponsor asset', value: 'sponsor'},
        ],
      },
      validation: r => r.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Short internal label, e.g. "Anti #34 buzzer-beater vs Lund".',
      validation: r => r.required(),
    }),
    defineField({
      name: 'captionSv',
      title: 'Caption (Svenska)',
      type: 'string',
      description: 'Shown on photo overlays, e.g. "Familjen · 2026".',
    }),
    defineField({
      name: 'captionEn',
      title: 'Caption (English)',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Photo file',
      type: 'image',
      options: {hotspot: true, accept: 'image/*'},
      hidden: ({parent}) => parent?.kind !== 'photo',
      description: 'Drag-drop an image (JPG/PNG/WEBP). Used when Type = Photo.',
    }),
    defineField({
      name: 'video',
      title: 'Video file',
      type: 'file',
      options: {accept: 'video/mp4,video/webm,video/quicktime'},
      hidden: ({parent}) => parent?.kind !== 'video',
      description: 'Upload an .mp4 (recommended), .webm, or .mov. Used when Type = Video.',
    }),
    defineField({
      name: 'poster',
      title: 'Video poster (thumbnail)',
      type: 'image',
      options: {hotspot: true, accept: 'image/*'},
      hidden: ({parent}) => parent?.kind !== 'video',
      description: 'Optional. Shown before the video loads. If empty, falls back to the family hero photo.',
    }),
    defineField({
      name: 'placement',
      title: 'Specific placement slot',
      type: 'string',
      description: 'Optional. Pin this asset to a specific spot. If set, this asset replaces the default at that spot.',
      options: {
        list: [
          {title: '— None (appears in its category list) —', value: ''},
          {title: 'Hero · Family photo', value: 'hero-family'},
          {title: 'Tip-off · Match-day reel video', value: 'tipoff-reel'},
          {title: 'Merch · Blue & Gold', value: 'merch-blue-gold'},
          {title: 'Merch · Yellow & Blue', value: 'merch-yellow-blue'},
          {title: 'Merch · Casual Run', value: 'merch-casual'},
          {title: 'Merch · Fan Collection', value: 'merch-fans'},
        ],
      },
    }),
    defineField({
      name: 'takenAt',
      title: 'Taken at',
      type: 'date',
      description: 'Used for sorting (newest first). Defaults to upload date.',
    }),
    defineField({
      name: 'credit',
      title: 'Credit / Photographer',
      type: 'string',
    }),
    defineField({
      name: 'active',
      title: 'Visible on site',
      type: 'boolean',
      description: 'Uncheck to hide without deleting.',
      initialValue: true,
    }),
    defineField({
      name: 'order',
      title: 'Sort priority',
      type: 'number',
      description: 'Higher numbers appear first within a category. Leave empty for date-based order.',
    }),
  ],
  orderings: [
    {title: 'Taken at (newest first)', name: 'takenDesc', by: [{field: 'takenAt', direction: 'desc'}]},
    {title: 'Category', name: 'categoryAsc', by: [{field: 'category', direction: 'asc'}, {field: 'takenAt', direction: 'desc'}]},
    {title: 'Sort priority', name: 'orderDesc', by: [{field: 'order', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'title', category: 'category', kind: 'kind', media: 'image', poster: 'poster', active: 'active'},
    prepare: ({title, category, kind, media, poster, active}) => ({
      title: active === false ? `[hidden] ${title}` : title,
      subtitle: `${kind === 'video' ? '▶ Video' : '📷 Photo'} · ${category || 'uncategorized'}`,
      media: kind === 'video' ? poster : media,
    }),
  },
})
