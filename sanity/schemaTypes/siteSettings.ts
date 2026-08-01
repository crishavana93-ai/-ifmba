import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({name: 'heroTaglineSv', title: 'Hero Tagline (Swedish)', type: 'string', initialValue: 'Inte bara ett lag — en familj, en rörelse, en stad. 15 nationer. 1 tröja. Malmös streetball headquarters.'}),
    defineField({name: 'heroTaglineEn', title: 'Hero Tagline (English)', type: 'string', initialValue: 'Not just a team — a family, a movement, a city. 15 nations. 1 jersey. Malmö\'s streetball headquarters.'}),
    defineField({name: 'season', title: 'Season', type: 'string', initialValue: '2026/27'}),
    defineField({name: 'division', title: 'Division', type: 'string', initialValue: 'Div 2 Skåne'}),
    defineField({name: 'heroImage', title: 'Hero Background Image', type: 'image'}),
    defineField({name: 'aboutTextSv', title: 'About Text (Swedish)', type: 'text'}),
    defineField({name: 'aboutTextEn', title: 'About Text (English)', type: 'text'}),
    defineField({name: 'contactEmail', title: 'Contact Email', type: 'string', initialValue: 'info@ifmba.se'}),
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
      initialValue: '',
      description: '10-digit Swish number (club account). Leave empty to show a "coming soon" placeholder on /donera and hide the homepage Swish block entirely.',
    }),
    defineField({
      name: 'swishPayee',
      title: 'Swish Payee Name',
      type: 'string',
      initialValue: 'MBA Malmö Basket',
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

    // ── Gear donations (in-kind for international communities) ────
    // People donating used basketballs, shoes, jerseys, etc. The club
    // forwards gear to international basketball communities in need.
    // Primary contact = email (creates a paper trail, looks more
    // professional than WhatsApp). WhatsApp number is optional —
    // leave empty to hide that button.
    defineField({
      name: 'gearContactEmail',
      title: 'Gear Donations Contact Email',
      type: 'string',
      initialValue: 'info@ifmba.se',
      description: 'Email donors message to arrange handoff. Defaults to info@ifmba.se; if a dedicated alias like gear@ifmba.se is set up later, paste that instead.',
    }),
    defineField({
      name: 'gearWhatsappNumber',
      title: 'Gear Donations WhatsApp Number (Optional)',
      type: 'string',
      initialValue: '',
      description: 'Optional secondary contact. E.164 format, no plus, no spaces (e.g. 46723173140). Leave empty to hide the WhatsApp button.',
    }),
    defineField({
      name: 'gearMessageSv',
      title: 'Gear Donation Email/WhatsApp Subject (Swedish)',
      type: 'text',
      rows: 2,
      initialValue: 'Donera utrustning till MBA',
      description: 'Pre-filled email subject / WhatsApp message (Swedish).',
    }),
    defineField({
      name: 'gearMessageEn',
      title: 'Gear Donation Email/WhatsApp Subject (English)',
      type: 'text',
      rows: 2,
      initialValue: 'Donate basketball gear to MBA',
    }),
    // Stats panel — four counters Cris updates by hand in Studio.
    defineField({
      name: 'gearStatShoesCount',
      title: 'Gear Stats — Pairs of Shoes Collected',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'gearStatBallsCount',
      title: 'Gear Stats — Basketballs Collected',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'gearStatClothesCount',
      title: 'Gear Stats — Clothing Items Collected',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'gearStatKitsCount',
      title: 'Gear Stats — Kits Distributed to Players',
      type: 'number',
      initialValue: 0,
      description: 'Total complete kits (shoes + ball + jersey) handed out to players in need.',
    }),
  ],
})
