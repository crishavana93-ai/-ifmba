/**
 * subscriber — a newsletter email captured from the footer signup.
 *
 * Written server-side by POST /api/newsletter using the write token, so
 * visitors never hit Sanity directly. Deliberately minimal — we only hold
 * what's needed to email them later. GDPR consent is logged with a
 * timestamp so we can prove lawful basis for processing.
 */
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'subscriber',
  title: 'Newsletter subscriber',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (r) =>
        r.required().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/i, {
          name: 'email',
          invert: false,
        }),
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      initialValue: 'footer',
      readOnly: true,
    }),
    defineField({
      name: 'consent',
      title: 'GDPR consent given',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'userAgent',
      title: 'User-agent',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'subscribedAt',
      title: 'Subscribed at',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'unsubscribedAt',
      title: 'Unsubscribed at',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'active',
      options: {
        list: [
          {title: '✅ Active', value: 'active'},
          {title: '🚫 Unsubscribed', value: 'unsubscribed'},
          {title: '⚠️ Bounced', value: 'bounced'},
        ],
        layout: 'radio',
      },
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'subscribedAtDesc',
      by: [{field: 'subscribedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'email', status: 'status'},
    prepare({title, status}: any) {
      const icon = status === 'unsubscribed' ? '🚫' : status === 'bounced' ? '⚠️' : '✅'
      return {title, subtitle: icon}
    },
  },
})
