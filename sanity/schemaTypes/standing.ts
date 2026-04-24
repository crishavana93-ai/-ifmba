import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'standing',
  title: 'Standing',
  type: 'document',
  fields: [
    defineField({name: 'team', title: 'Team Name', type: 'string', validation: r => r.required()}),
    defineField({name: 'shortName', title: 'Short Name (for hex grid)', type: 'string'}),
    defineField({name: 'wins', title: 'Wins', type: 'number', initialValue: 0}),
    defineField({name: 'losses', title: 'Losses', type: 'number', initialValue: 0}),
    defineField({name: 'points', title: 'Points', type: 'number', initialValue: 0}),
    defineField({name: 'position', title: 'Position', type: 'number'}),
    defineField({name: 'isUs', title: 'Is MBA', type: 'boolean', initialValue: false}),
    defineField({
      name: 'series',
      title: 'Series / Division',
      type: 'string',
      description: 'Which tab this row appears under on the site.',
      options: {
        list: [
          {title: 'Div 3 Skåne Herr · 2025/26 (current)', value: 'div3'},
          {title: 'Div 2 Skåne Herr · 2026/27 (next season)', value: 'div2'},
        ],
      },
      initialValue: 'div3',
    }),
  ],
  orderings: [{title: 'Position', name: 'posAsc', by: [{field: 'position', direction: 'asc'}]}],
  preview: {select: {title: 'team', subtitle: 'position'}, prepare: ({title, subtitle}) => ({title: `#${subtitle} ${title}`})}
})
