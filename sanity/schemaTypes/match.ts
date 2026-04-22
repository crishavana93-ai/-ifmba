import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'match',
  title: 'Match',
  type: 'document',
  fields: [
    defineField({name: 'date', title: 'Date & Time', type: 'datetime', validation: r => r.required()}),
    defineField({name: 'opponent', title: 'Opponent', type: 'string', validation: r => r.required()}),
    defineField({name: 'home', title: 'Home Game', type: 'boolean', initialValue: true}),
    defineField({name: 'venue', title: 'Venue', type: 'string', initialValue: 'Latinskolans sporthall'}),
    defineField({name: 'played', title: 'Match Played', type: 'boolean', initialValue: false}),
    defineField({name: 'scoreUs', title: 'MBA Score', type: 'number'}),
    defineField({name: 'scoreThem', title: 'Opponent Score', type: 'number'}),
    defineField({name: 'topScorer', title: 'Top Scorer', type: 'reference', to: [{type: 'player'}]}),
    defineField({name: 'topPoints', title: 'Top Scorer Points', type: 'number'}),
  ],
  orderings: [{title: 'Date', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]}],
  preview: {select: {date: 'date', opponent: 'opponent', scoreUs: 'scoreUs', scoreThem: 'scoreThem'}, prepare: ({date, opponent, scoreUs, scoreThem}) => ({title: `MBA vs ${opponent}`, subtitle: scoreUs != null ? `${scoreUs}-${scoreThem}` : new Date(date).toLocaleDateString('sv-SE')})}
})
