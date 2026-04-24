/**
 * prediction — one fan's guess for a predictionRound.
 *
 * Created server-side by POST /api/prediction. `points` is left blank at
 * submission time and filled in when `/api/prediction/score` is called
 * (or manually via Studio) after the round is finalized.
 *
 * Scoring model (v1):
 *   • Exact MBA+opponent score → 10 pts
 *   • Correct winner + total score within 5 → 5 pts
 *   • Correct winner only → 2 pts
 *   • Top scorer guess correct (case-insensitive) → +3 pts
 */
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'prediction',
  title: 'Prediction',
  type: 'document',
  fields: [
    defineField({
      name: 'round',
      title: 'Round',
      type: 'reference',
      to: [{type: 'predictionRound'}],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'displayName',
      title: 'Display name',
      type: 'string',
      description: 'Shown publicly on the leaderboard.',
      validation: (r) => r.required().min(1).max(40),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      description: 'Optional — only used if they win a prize.',
    }),
    defineField({
      name: 'mbaScore',
      title: 'Predicted MBA score',
      type: 'number',
      validation: (r) => r.required().integer().min(0).max(300),
    }),
    defineField({
      name: 'opponentScore',
      title: 'Predicted opponent score',
      type: 'number',
      validation: (r) => r.required().integer().min(0).max(300),
    }),
    defineField({
      name: 'topScorerGuess',
      title: 'Top-scorer guess (MBA)',
      type: 'string',
    }),
    defineField({
      name: 'points',
      title: 'Points awarded',
      type: 'number',
      description: 'Filled after round is finalized.',
    }),
    defineField({
      name: 'userAgent',
      title: 'User-agent',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'createdAt',
      title: 'Submitted at',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: 'Points — highest first',
      name: 'pointsDesc',
      by: [{field: 'points', direction: 'desc'}],
    },
    {
      title: 'Newest first',
      name: 'createdAtDesc',
      by: [{field: 'createdAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'displayName', mba: 'mbaScore', opp: 'opponentScore', pts: 'points'},
    prepare({title, mba, opp, pts}: any) {
      const score = `${mba} – ${opp}`
      const subtitle = pts != null ? `${score}  ·  ${pts} pts` : score
      return {title, subtitle}
    },
  },
})
