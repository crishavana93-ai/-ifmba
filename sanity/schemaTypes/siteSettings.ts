import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({name: 'heroTaglineSv', title: 'Hero Tagline (Swedish)', type: 'string', initialValue: 'Inte bara ett lag — en familj, en rörelse, en stad. 9 nationer. 1 tröja. Malmös streetball headquarters.'}),
    defineField({name: 'heroTaglineEn', title: 'Hero Tagline (English)', type: 'string', initialValue: 'Not just a team — a family, a movement, a city. 9 nations. 1 jersey. Malmö\'s streetball headquarters.'}),
    defineField({name: 'season', title: 'Season', type: 'string', initialValue: '2025/26'}),
    defineField({name: 'division', title: 'Division', type: 'string', initialValue: 'Div 3 Skåne'}),
    defineField({name: 'heroImage', title: 'Hero Background Image', type: 'image'}),
    defineField({name: 'aboutTextSv', title: 'About Text (Swedish)', type: 'text'}),
    defineField({name: 'aboutTextEn', title: 'About Text (English)', type: 'text'}),
    defineField({name: 'contactEmail', title: 'Contact Email', type: 'string', initialValue: 'mba.malmo.basket@gmail.com'}),
    // ── Social media URLs. Paste full https://... links here.
    // Each one is optional — Footer only renders an icon for platforms
    // that have a non-empty URL, so leaving a field blank hides that icon.
    defineField({name: 'instagramUrl', title: 'Instagram URL',  type: 'url', description: 'e.g. https://instagram.com/mba_malmo'}),
    defineField({name: 'facebookUrl',  title: 'Facebook URL',   type: 'url', description: 'e.g. https://facebook.com/mba_malmo'}),
    defineField({name: 'tiktokUrl',    title: 'TikTok URL',     type: 'url', description: 'e.g. https://tiktok.com/@mba_malmo'}),
    defineField({name: 'youtubeUrl',   title: 'YouTube URL',    type: 'url', description: 'e.g. https://youtube.com/@mba_malmo'}),
    defineField({name: 'nextMatchDate', title: 'Next Match Date', type: 'datetime'}),
    defineField({name: 'nextMatchOpponent', title: 'Next Match Opponent', type: 'string'}),
    defineField({name: 'nextMatchVenue', title: 'Next Match Venue', type: 'string'}),
    defineField({name: 'spotlightPlayer', title: 'Player of the Month', type: 'reference', to: [{type: 'player'}]}),
    defineField({name: 'spotlightQuoteSv', title: 'Spotlight Quote (Swedish)', type: 'text'}),
    defineField({name: 'spotlightQuoteEn', title: 'Spotlight Quote (English)', type: 'text'}),

    // ── Swish donations ─────────────────────────────────────────────
    // Swish is Sweden's de-facto donation rail. We display the number + a
    // QR code on the public site. Visitors swipe the QR in their bank app
    // or type the number manually. We track the season goal here so the
    // progress bar renders without a database call.
    defineField({
      name: 'swishNumber',
      title: 'Swish Number',
      type: 'string',
      initialValue: '0723173140',
      description: '10-digit Swish number. Personal Swish: leading 0 + mobile (e.g. 0723173140). Business Swish: 123-prefix (e.g. 1234567890). Spaces are auto-stripped. Leave empty to hide the donation block.',
    }),
    defineField({
      name: 'swishPayee',
      title: 'Swish Payee Name',
      type: 'string',
      initialValue: 'IFK Malmö Basket',
      description: 'Shown to donor in their banking app after they scan.',
    }),
    defineField({
      name: 'swishMessage',
      title: 'Default Swish Message',
      type: 'string',
      initialValue: 'MBA Säsong 2026/27',
      description: 'Pre-filled message so donations are reconcilable.',
    }),
    defineField({
      name: 'swishGoalSek',
      title: 'Season Goal (SEK)',
      type: 'number',
      initialValue: 50000,
      description: 'Target amount for the season (drives the progress bar).',
    }),
    defineField({
      name: 'swishRaisedSek',
      title: 'Raised So Far (SEK)',
      type: 'number',
      initialValue: 0,
      description: 'Update manually after each transfer reconciliation.',
    }),
    defineField({
      name: 'swishGoalLabelSv',
      title: 'Donation Goal Label (Swedish)',
      type: 'string',
      initialValue: 'Hjälp oss till Div 1',
    }),
    defineField({
      name: 'swishGoalLabelEn',
      title: 'Donation Goal Label (English)',
      type: 'string',
      initialValue: 'Help us reach Div 1',
    }),
  ],
})
