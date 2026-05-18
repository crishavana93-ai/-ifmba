/**
 * reservation — a customer's interest in a /butik product.
 *
 * In Phase 1 (pre-Shopify) this is a manual fulfillment workflow:
 *   1. Customer fills the reservation modal on /butik → POST /api/reservation
 *   2. We create this doc + email both Cris and the customer
 *   3. Cris opens the supplier URL from the admin email, places the dropship
 *      order on AliExpress, and pastes the AliExpress tracking number back
 *      into this doc
 *   4. Customer gets a "shipped" email when Cris flips status to "shipped"
 *
 * When Shopify is wired up later, this schema is retired in favor of
 * Shopify's native order model.
 */
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'reservation',
  title: 'Reservation',
  type: 'document',
  fields: [
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: '🆕 New — needs supplier order', value: 'new'},
          {title: '📦 Ordered from supplier', value: 'ordered'},
          {title: '✈️ Shipped to customer', value: 'shipped'},
          {title: '✅ Delivered', value: 'delivered'},
          {title: '❌ Cancelled', value: 'cancelled'},
        ],
      },
      initialValue: 'new',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      validation: (r) => r.required(),
    }),
    // ── Product snapshot ─────────────────────────────────────────────
    defineField({
      name: 'product',
      title: 'Product',
      type: 'reference',
      to: [{type: 'dropshipProduct'}],
    }),
    defineField({name: 'productName',     title: 'Product Name (snapshot)', type: 'string'}),
    defineField({name: 'productPriceSek', title: 'Price at order (SEK)',    type: 'number'}),
    defineField({name: 'productSourceUrl',title: 'Supplier URL (for fulfillment)', type: 'url',
      description: 'Open this to place the dropship order on AliExpress.'}),
    // ── Customer ────────────────────────────────────────────────────
    defineField({name: 'customerEmail',  title: 'Customer Email', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'customerName',   title: 'Customer Name',  type: 'string', validation: (r) => r.required()}),
    defineField({name: 'shippingAddress', title: 'Shipping Address', type: 'text', rows: 4}),
    defineField({name: 'size',           title: 'Size', type: 'string'}),
    defineField({name: 'quantity',       title: 'Quantity', type: 'number', initialValue: 1}),
    defineField({name: 'note',           title: 'Customer Note', type: 'text', rows: 3}),
    // ── Fulfillment ─────────────────────────────────────────────────
    defineField({name: 'trackingNumber', title: 'Supplier Tracking Number', type: 'string'}),
    defineField({name: 'internalNotes',  title: 'Internal Notes',           type: 'text', rows: 3,
      description: 'Notes for the club. Not shown to the customer.'}),
    // ── Diagnostics ─────────────────────────────────────────────────
    defineField({name: 'userAgent', title: 'User Agent', type: 'string', hidden: true}),
  ],
  orderings: [
    {title: 'Newest first', name: 'createdDesc', by: [{field: 'createdAt', direction: 'desc'}]},
    {title: 'Status', name: 'statusAsc', by: [{field: 'status', direction: 'asc'}, {field: 'createdAt', direction: 'desc'}]},
  ],
  preview: {
    select: {
      title: 'productName',
      subtitle: 'customerName',
      status: 'status',
      qty: 'quantity',
    },
    prepare: ({title, subtitle, status, qty}) => {
      const icons: Record<string, string> = {
        new: '🆕', ordered: '📦', shipped: '✈️', delivered: '✅', cancelled: '❌',
      }
      return {
        title: `${icons[status] || '•'} ${qty || 1}× ${title || '(no product)'}`,
        subtitle: subtitle || '(no customer)',
      }
    },
  },
})
