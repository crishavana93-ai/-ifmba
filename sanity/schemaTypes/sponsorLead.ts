/**
 * sponsorLead — inbound sponsor interest captured from the /partners page
 * form. Created server-side by POST /api/sponsor-lead using the write token,
 * so visitors never hit Sanity directly.
 *
 * Operational flow for Cris:
 *   1. Visitor fills the form on /partners.
 *   2. Row lands here under "Sponsor Leads" in the Studio sidebar, ordered
 *      by createdAt desc so newest sits at the top.
 *   3. Cris sets status as he works each lead: new → contacted → qualified
 *      → closed-won / closed-lost.
 *   4. (Optional, Phase 2) Resend email fires to Cris whenever a row is
 *      created, so he doesn't have to poll Studio.
 */
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'sponsorLead',
  title: 'Sponsor Lead',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Contact name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (r) =>
        r
          .required()
          .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/i, {name: 'email', invert: false}),
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),
    defineField({
      name: 'tier',
      title: 'Tier interest',
      type: 'string',
      options: {
        list: [
          {title: 'Platinum · 75 000 kr / 2 år', value: 'Platinum'},
          {title: 'Guld · 50 000 kr / 2 år', value: 'Gold'},
          {title: 'Silver · 25 000 kr / 2 år', value: 'Silver'},
          {title: 'Brons · 10 000 kr / 2 år', value: 'Bronze'},
          {title: 'Ingen preferens', value: 'Any'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'budget',
      title: 'Budget band',
      type: 'string',
      options: {
        list: [
          {title: '< 25 000 kr', value: 'lt25'},
          {title: '25 000 – 50 000 kr', value: '25to50'},
          {title: '50 000 – 100 000 kr', value: '50to100'},
          {title: '100 000 kr +', value: 'gt100'},
          {title: 'Ej angett', value: 'tbd'},
        ],
      },
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'consent',
      title: 'GDPR consent given',
      type: 'boolean',
      initialValue: false,
      description:
        'Set true when the visitor ticks the GDPR consent box in the form.',
    }),
    defineField({
      name: 'status',
      title: 'Pipeline status',
      type: 'string',
      initialValue: 'new',
      options: {
        list: [
          {title: '🆕 New', value: 'new'},
          {title: '📞 Contacted', value: 'contacted'},
          {title: '🤝 Qualified', value: 'qualified'},
          {title: '✅ Closed – Won', value: 'won'},
          {title: '❌ Closed – Lost', value: 'lost'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      initialValue: 'partners-form',
      readOnly: true,
    }),
    defineField({
      name: 'userAgent',
      title: 'User-agent',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'createdAt',
      title: 'Received at',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'createdAtDesc',
      by: [{field: 'createdAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'company',
      subtitle: 'name',
      status: 'status',
      tier: 'tier',
    },
    prepare({title, subtitle, status, tier}: any) {
      const statusEmoji =
        status === 'won' ? '✅'
        : status === 'lost' ? '❌'
        : status === 'qualified' ? '🤝'
        : status === 'contacted' ? '📞'
        : '🆕'
      return {
        title: title || '(no company)',
        subtitle: `${statusEmoji} ${subtitle || ''}${tier ? ' · ' + tier : ''}`,
      }
    },
  },
})
