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
    defineField({name: 'instagramUrl', title: 'Instagram URL',  type: 'url', description: 'e.g. https://instagram.com/ifkmalmobasket'}),
    defineField({name: 'facebookUrl',  title: 'Facebook URL',   type: 'url', description: 'e.g. https://facebook.com/ifkmalmobasket'}),
    defineField({name: 'tiktokUrl',    title: 'TikTok URL',     type: 'url', description: 'e.g. https://tiktok.com/@ifkmalmobasket'}),
    defineField({name: 'youtubeUrl',   title: 'YouTube URL',    type: 'url', description: 'e.g. https://youtube.com/@ifkmalmobasket'}),
    defineField({name: 'nextMatchDate', title: 'Next Match Date', type: 'datetime'}),
    defineField({name: 'nextMatchOpponent', title: 'Next Match Opponent', type: 'string'}),
    defineField({name: 'nextMatchVenue', title: 'Next Match Venue', type: 'string'}),
    defineField({name: 'spotlightPlayer', title: 'Player of the Month', type: 'reference', to: [{type: 'player'}]}),
    defineField({name: 'spotlightQuoteSv', title: 'Spotlight Quote (Swedish)', type: 'text'}),
    defineField({name: 'spotlightQuoteEn', title: 'Spotlight Quote (English)', type: 'text'}),
  ],
})
