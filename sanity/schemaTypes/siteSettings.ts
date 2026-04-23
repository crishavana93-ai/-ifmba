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
    defineField({name: 'instagramUrl', title: 'Instagram URL', type: 'url'}),
    defineField({name: 'nextMatchDate', title: 'Next Match Date', type: 'datetime'}),
    defineField({name: 'nextMatchOpponent', title: 'Next Match Opponent', type: 'string'}),
    defineField({name: 'nextMatchVenue', title: 'Next Match Venue', type: 'string'}),
    defineField({name: 'spotlightPlayer', title: 'Player of the Month', type: 'reference', to: [{type: 'player'}]}),
    defineField({name: 'spotlightQuoteSv', title: 'Spotlight Quote (Swedish)', type: 'text'}),
    defineField({name: 'spotlightQuoteEn', title: 'Spotlight Quote (English)', type: 'text'}),
  ],
})
