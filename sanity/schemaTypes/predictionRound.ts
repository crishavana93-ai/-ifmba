/**
 * predictionRound — one open "guess the score" game.
 *
 * Admin (Cris) creates a round in Studio before each upcoming match:
 *   • matchup, matchDate, deadline (when the form closes)
 * After the match, Cris fills in:
 *   • finalMbaScore, finalOpponentScore, topScorerActual
 * Points get tallied server-side when the first GET on the leaderboard
 * endpoint fires after `status = 'final'`.
 *
 * UI picks the single round with status === 'open' as the active one.
 */
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'predictionRound',
  title: 'Prediction round',
  type: 'document',
  fields: [
    defineField({
      name: 'matchup',
      title: 'Matchup',
      type: 'string',
      description: 'e.g. "MBA vs Team4Q Div3"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'matchDate',
      title: 'Match tip-off',
      type: 'datetime',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'deadline',
      title: 'Voting deadline',
      type: 'datetime',
      description:
        'Predictions close at this time — usually 1 hour before tip-off.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'open',
      options: {
        list: [
          {title: '🟢 Open (accepting predictions)', value: 'open'},
          {title: '🟡 Closed (deadline passed, awaiting result)', value: 'closed'},
          {title: '✅ Final (results scored)', value: 'final'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'finalMbaScore',
      title: 'Final MBA score',
      type: 'number',
      description: 'Fill in after the match to score the round.',
    }),
    defineField({
      name: 'finalOpponentScore',
      title: 'Final opponent score',
      type: 'number',
    }),
    defineField({
      name: 'topScorerActual',
      title: 'Actual top scorer (MBA)',
      type: 'string',
      description: 'Case-insensitive match against predictions.',
    }),
  ],
  orderings: [
    {
      title: 'Match date — upcoming first',
      name: 'matchDateAsc',
      by: [{field: 'matchDate', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'matchup', date: 'matchDate', status: 'status'},
    prepare({title, date, status}: any) {
      const icon =
        status === 'open' ? '🟢' : status === 'closed' ? '🟡' : status === 'final' ? '✅' : '⚪'
      const when = date ? new Date(date).toLocaleDateString('sv-SE') : ''
      return {title: `${icon} ${title}`, subtitle: when}
    },
  },
})
