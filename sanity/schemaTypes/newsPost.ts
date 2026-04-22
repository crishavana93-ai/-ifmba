import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'newsPost',
  title: 'News Post',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: r => r.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title'}, validation: r => r.required()}),
    defineField({name: 'body', title: 'Body', type: 'array', of: [{type: 'block'}, {type: 'image', options: {hotspot: true}}]}),
    defineField({name: 'coverImage', title: 'Cover Image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'tag', title: 'Tag', type: 'string', options: {list: ['Game Day','Transfer','Community','Event','Media']}}),
    defineField({name: 'publishedAt', title: 'Published At', type: 'datetime'}),
  ],
  orderings: [{title: 'Published', name: 'pubDesc', by: [{field: 'publishedAt', direction: 'desc'}]}],
  preview: {select: {title: 'title', subtitle: 'tag', media: 'coverImage'}}
})
