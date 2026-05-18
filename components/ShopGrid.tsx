'use client'
import { useEffect, useMemo, useState } from 'react'
/**
 * ShopGrid — renders a section of dropshipProducts as a card grid.
 *
 * Used by /butik to show MBA Official + Fan Drop in separate sections.
 *
 * Each card:
 *   - Photo (Sanity-hosted), with optional "NEW / LIMITED" ribbon
 *   - Name, price (compare-at strikethrough if set)
 *   - Ship-from chip (🇪🇺 / 🇨🇳 / 🇸🇪)
 *   - Reserve CTA → mailto: to Cris with subject pre-filled (Phase 1).
 *     When Shopify is live, swap the CTA to a Stripe checkout link.
 */

import { useLang } from '@/lib/i18n'

type Product = {
  _id: string
  name: string
  slug?: string
  category?: string
  sourceType?: string
  sourceUrl?: string
  sourceCostSek?: number
  priceSek: number
  compareAtPriceSek?: number
  imageUrl?: string | null
  descriptionSv?: string
  descriptionEn?: string
  tag?: string
  shipsFrom?: string
}

const SHIP_LABEL: Record<string, string> = {
  eu: '🇪🇺 EU',
  cn: '🇨🇳 CN',
  se: '🇸🇪 SE',
  us: '🇺🇸 US',
}

function fmtSek(n: number | undefined) {
  if (!n && n !== 0) return ''
  return new Intl.NumberFormat('sv-SE').format(n) + ' kr'
}

/** Calculate margin from source cost + retail. Returns null if either is missing. */
function calcMargin(cost?: number, price?: number): number | null {
  if (!cost || !price || price <= 0) return null
  return Math.round((1 - cost / price) * 100)
}

/** Category → icon glyph mapping for the empty-photo state. */
function categoryGlyph(cat?: string): string {
  switch (cat) {
    case 'apparel-jersey':       return '\u{1F3BD}' // 🎽 running shirt
    case 'apparel-shorts':       return '\u{1FA73}' // 🩳 shorts
    case 'apparel-hoodie':       return '\u{1F455}' // 👕
    case 'apparel-cap':          return '\u{1F9E2}' // 🧢
    case 'apparel-tee':          return '\u{1F455}' // 👕
    case 'accessories-compression': return '\u{1F4AA}' // 💪
    case 'accessories-socks':    return '\u{1F9E6}' // 🧦
    case 'accessories-bags':     return '\u{1F392}' // 🎒
    case 'fan-gear':             return '\u{1F3C0}' // 🏀
    default:                     return '\u{1F3C0}' // 🏀
  }
}

export default function ShopGrid({
  products,
  eyebrow,
  title,
  body,
  num,
  numText,
  className,
}: {
  products: Product[]
  eyebrow: string
  title: string
  body?: string
  num?: string
  numText?: string
  className?: string
}) {
  const { lang } = useLang()

  // Admin view: append `?admin=1` to /butik URL to reveal cost + margin per
  // card (so Cris can scan profitability at a glance without exposing it
  // to customers). Survives navigation via localStorage.
  const [adminMode, setAdminMode] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('admin') === '1') {
      window.localStorage.setItem('mba_shop_admin', '1')
    } else if (params.get('admin') === '0') {
      window.localStorage.removeItem('mba_shop_admin')
    }
    setAdminMode(window.localStorage.getItem('mba_shop_admin') === '1')
  }, [])

  // Reservation modal — only one card at a time. Setting `reserving` to a
  // product opens the modal; null closes it.
  const [reserving, setReserving] = useState<Product | null>(null)

  return (
    <section
      className={`shopgrid section ${className || ''}`.trim()}
      data-num={num}
      data-num-text={numText}
    >
      <div className="contain">
        <div className="label">{eyebrow}</div>
        <h2
          className="title"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        {body && <p className="shopgrid-body">{body}</p>}

        <div className="shopgrid-grid">
          {products.map((p) => {
            const desc = (lang === 'en' ? p.descriptionEn : p.descriptionSv) || ''

            return (
              <article key={p._id} className="shop-card">
                <div className="shop-photo">
                  {p.tag && <span className="shop-tag">{p.tag}</span>}
                  {p.shipsFrom && SHIP_LABEL[p.shipsFrom] && (
                    <span className="shop-ship">{SHIP_LABEL[p.shipsFrom]}</span>
                  )}
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} loading="lazy" decoding="async" />
                  ) : (
                    // Intentional empty state — category icon + product name,
                    // looks designed rather than broken until the photo lands.
                    <div className="shop-photo-empty">
                      <span className="shop-empty-icon" aria-hidden="true">
                        {categoryGlyph(p.category)}
                      </span>
                      <span className="shop-empty-label">{p.name}</span>
                    </div>
                  )}
                </div>

                <div className="shop-meta">
                  <div className="shop-name">{p.name}</div>
                  {desc && <div className="shop-desc">{desc}</div>}

                  <div className="shop-price-row">
                    <span className="shop-price">{fmtSek(p.priceSek)}</span>
                    {!!p.compareAtPriceSek && p.compareAtPriceSek > p.priceSek && (
                      <span className="shop-compare">{fmtSek(p.compareAtPriceSek)}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="shop-cta"
                    onClick={() => setReserving(p)}
                  >
                    {lang === 'en' ? 'Reserve →' : 'Reservera →'}
                  </button>

                  {adminMode && (
                    <AdminInfo product={p} />
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {reserving && (
        <ReservationModal
          product={reserving}
          lang={lang}
          onClose={() => setReserving(null)}
        />
      )}
    </section>
  )
}

/**
 * ReservationModal — collects customer details and POSTs to /api/reservation.
 * On success: shows confirmation + auto-closes after 4s.
 * On error: surfaces the message and keeps the form populated.
 */
function ReservationModal({
  product,
  lang,
  onClose,
}: {
  product: Product
  lang: 'sv' | 'en'
  onClose: () => void
}) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [size, setSize] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const mountedAt = useMemo(() => Date.now(), [])

  // Auto-close on success after 4s so the customer sees the confirmation.
  useEffect(() => {
    if (!done) return
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [done, onClose])

  // Esc closes the modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const t = lang === 'en'
    ? {
        title: 'Reserve',
        subtitle: 'We confirm by email within 24h with payment + delivery details.',
        name: 'Your name', email: 'Email', size: 'Size', qty: 'Quantity',
        address: 'Shipping address (optional)',
        note: 'Note for MBA (optional)',
        submit: 'Send reservation', sending: 'Sending…',
        done: 'Reservation received!',
        doneBody: 'We just emailed you a confirmation. We\'ll follow up within 24h.',
        cancel: 'Cancel',
      }
    : {
        title: 'Reservera',
        subtitle: 'Vi bekräftar via e-post inom 24 timmar med betalning + leverans.',
        name: 'Ditt namn', email: 'E-post', size: 'Storlek', qty: 'Antal',
        address: 'Leveransadress (valfritt)',
        note: 'Meddelande till MBA (valfritt)',
        submit: 'Skicka reservation', sending: 'Skickar…',
        done: 'Reservation mottagen!',
        doneBody: 'Vi har just mailat dig en bekräftelse. Vi hör av oss inom 24 timmar.',
        cancel: 'Avbryt',
      }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (submitting) return
    const trimmed = email.trim()
    if (!name.trim()) return setError(lang === 'en' ? 'Please add your name.' : 'Vänligen fyll i ditt namn.')
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return setError(lang === 'en' ? 'Please enter a valid email.' : 'Vänligen ange en giltig e-postadress.')
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          email: trimmed,
          name: name.trim(),
          size,
          quantity,
          shippingAddress: address.trim(),
          note: note.trim(),
          website_url: website,
          elapsedMs: Date.now() - mountedAt,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) throw new Error(data?.error || `HTTP ${res.status}`)
      setDone(true)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rsv-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="rsv-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="rsv-close" onClick={onClose} aria-label="Close">×</button>

        {done ? (
          <div className="rsv-done">
            <div className="rsv-done-icon">✓</div>
            <h3 className="rsv-done-title">{t.done}</h3>
            <p className="rsv-done-body">{t.doneBody}</p>
          </div>
        ) : (
          <>
            <div className="rsv-head">
              <div className="rsv-head-product">
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} />
                )}
                <div>
                  <h3 className="rsv-head-name">{product.name}</h3>
                  <div className="rsv-head-price">{fmtSek(product.priceSek)}</div>
                </div>
              </div>
              <p className="rsv-subtitle">{t.subtitle}</p>
            </div>

            <form className="rsv-form" onSubmit={handleSubmit} noValidate>
              {/* Honeypot — hidden from real humans */}
              <div aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
                <label>Website <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
              </div>

              <div className="rsv-field">
                <label htmlFor="rsv-name">{t.name}</label>
                <input id="rsv-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
              </div>

              <div className="rsv-field">
                <label htmlFor="rsv-email">{t.email}</label>
                <input id="rsv-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" inputMode="email" />
              </div>

              <div className="rsv-row">
                <div className="rsv-field" style={{ flex: 2 }}>
                  <label htmlFor="rsv-size">{t.size}</label>
                  <select id="rsv-size" value={size} onChange={(e) => setSize(e.target.value)}>
                    {['XS','S','M','L','XL','XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="rsv-field" style={{ flex: 1 }}>
                  <label htmlFor="rsv-qty">{t.qty}</label>
                  <input id="rsv-qty" type="number" min={1} max={10} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} />
                </div>
              </div>

              <div className="rsv-field">
                <label htmlFor="rsv-address">{t.address}</label>
                <textarea id="rsv-address" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" />
              </div>

              <div className="rsv-field">
                <label htmlFor="rsv-note">{t.note}</label>
                <textarea id="rsv-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
              </div>

              {error && <div className="rsv-error" role="alert">{error}</div>}

              <div className="rsv-actions">
                <button type="button" className="rsv-btn rsv-btn-ghost" onClick={onClose}>{t.cancel}</button>
                <button type="submit" className="rsv-btn rsv-btn-primary" disabled={submitting}>
                  {submitting ? t.sending : t.submit}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

/** Admin-only block visible when ?admin=1 set on /butik. Shows source cost,
 *  retail, margin %, and a link to the supplier page. Never shown to
 *  customers in the default view. */
function AdminInfo({ product: p }: { product: Product }) {
  const margin = calcMargin(p.sourceCostSek, p.priceSek)
  return (
    <div className="shop-admin">
      <div className="shop-admin-row">
        <span>Cost</span>
        <span>{fmtSek(p.sourceCostSek)}</span>
      </div>
      <div className="shop-admin-row">
        <span>Retail</span>
        <span>{fmtSek(p.priceSek)}</span>
      </div>
      <div className="shop-admin-row shop-admin-margin">
        <span>Margin</span>
        <span>{margin !== null ? `${margin}%` : '—'}</span>
      </div>
      {p.sourceUrl && (
        <a
          className="shop-admin-source"
          href={p.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open supplier ↗
        </a>
      )}
    </div>
  )
}
