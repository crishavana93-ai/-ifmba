import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'court',
  title: 'Court',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: r => r.required()}),
    defineField({name: 'type', title: 'Type', type: 'string', options: {list: ['Indoor','Outdoor']}}),
    defineField({name: 'description', title: 'Description', type: 'string'}),
    defineField({name: 'address', title: 'Address', type: 'string'}),
    defineField({name: 'isHome', title: 'Home Arena', type: 'boolean', initialValue: false}),
    defineField({name: 'photo', title: 'Photo', type: 'image', options: {hotspot: true}, description: 'Hero photo of the court. 16:9 or 4:3 preferred.'}),
    defineField({name: 'gallery', title: 'Gallery', type: 'array', of: [{type: 'image', options: {hotspot: true}}], description: 'Extra photos — training sessions, game days, exterior shots.'}),
    defineField({name: 'lat', title: 'Latitude', type: 'number'}),
    defineField({name: 'lng', title: 'Longitude', type: 'number'}),
  ],
  preview: {select: {title: 'name', subtitle: 'type', media: 'photo'}}
})
