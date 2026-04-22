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
    defineField({name: 'nationality', title: 'Nationality', type: 'string'}),
    defineField({name: 'flag', title: 'Flag Emoji', type: 'string'}),
    defineField({name: 'photo', title: 'Photo', type: 'image', options: {hotspot: true}}),
    defineField({name: 'quote', title: 'Quote', type: 'text'}),
    defineField({name: 'active', title: 'Active', type: 'boolean', initialValue: true}),
  ],
  orderings: [{title: 'Jersey Number', name: 'numberAsc', by: [{field: 'number', direction: 'asc'}]}],
  preview: {select: {title: 'lastName', subtitle: 'number', media: 'photo'}, prepare: ({title, subtitle, media}) => ({title: `#${subtitle} ${title}`, media})}
})
