import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'player',
  title: 'Player',
  type: 'document',
  fields: [
    defineField({name: 'number', title: 'Jersey Number', type: 'number', validation: r => r.required()}),
    defineField({name: 'firstName', title: 'First Name', type: 'string', validation: r => r.required()}),
    defineField({name: 'lastName', title: 'Last Name', type: 'string', validation: r => r.required()}),
    defineField({name: 'position', title: 'Position', type: 'string', options: {list: ['Guard','Forward','Center','Point Guard','Shooting Guard','Small Forward','Power Forward']}}),
    defineField({
      name: 'nationality',
      title: 'Nationality',
      type: 'string',
      options: {
        // Note: this is a curated list — to add a new nationality, edit
        // the schema here, then redeploy. The Studio dropdown will show
        // the new option for every player. Listed alphabetically (Swedish
        // names) except Sverige first so the home-country lands at top.
        list: [
          {title: '🇸🇪 Sverige', value: 'Sverige'},
          {title: '🇦🇱 Albanien', value: 'Albanien'},
          {title: '🇦🇷 Argentina', value: 'Argentina'},
          {title: '🇦🇺 Australien', value: 'Australien'},
          {title: '🇪🇷 Eritrea', value: 'Eritrea'},
          {title: '🇵🇭 Filippinerna', value: 'Filippinerna'},
          {title: '🇬🇭 Ghana', value: 'Ghana'},
          {title: '🇬🇷 Grekland', value: 'Grekland'},
          {title: '🇮🇪 Irland', value: 'Irland'},
          {title: '🇮🇹 Italien', value: 'Italien'},
          {title: '🇽🇰 Kosovo', value: 'Kosovo'},
          {title: '🇭🇷 Kroatien', value: 'Kroatien'},
          {title: '🇨🇺 Kuba', value: 'Kuba'},
          {title: '🇲🇰 Nordmakedonien', value: 'Nordmakedonien'},
          {title: '🇲🇽 Mexiko', value: 'Mexiko'},
          {title: '🇳🇬 Nigeria', value: 'Nigeria'},
          {title: '🇷🇸 Serbien', value: 'Serbien'},
          {title: '🇹🇳 Tunisien', value: 'Tunisien'},
          {title: '🇹🇷 Turkiet', value: 'Turkiet'},
          {title: '🇩🇪 Tyskland', value: 'Tyskland'},
        ],
      },
    }),
    defineField({
      name: 'flag',
      title: 'Flag Emoji',
      type: 'string',
      description: 'Auto-suggested from nationality, but you can override (e.g. 🇸🇪, 🇮🇹, 🇭🇷, 🇮🇪, 🇦🇷, 🇦🇺, 🇩🇪).',
    }),
    defineField({name: 'photo', title: 'Photo', type: 'image', options: {hotspot: true}}),
    defineField({name: 'quote', title: 'Quote', type: 'text'}),
    defineField({name: 'active', title: 'Active', type: 'boolean', initialValue: true}),
  ],
  orderings: [{title: 'Jersey Number', name: 'numberAsc', by: [{field: 'number', direction: 'asc'}]}],
  preview: {select: {title: 'lastName', subtitle: 'number', media: 'photo'}, prepare: ({title, subtitle, media}) => ({title: `#${subtitle} ${title}`, media})}
})
