/**
 * POST /api/reservation
 *
 * Receives a customer's "Reservera" submission from /butik. Writes a
 * `reservation` doc in Sanity and sends TWO emails via Resend:
 *   1. Admin notification → Cris, with product + supplier (AliExpress) URL
 *   2. Customer confirmation → the buyer, with order details
 *
 * Both emails are non-blocking: if Resend isn't configured, the reservation
 * still lands in Sanity (visible in Studio → 📥 Reservations).
 *
 * Body shape:
 *   {
 *     productId: "dropshipProduct-<slug>",
 *     email: "customer@example.com",
 *     name: "Customer Name",
 *     size?: "M",
 *     quantity?: 1,
 *     shippingAddress?: "...",
 *     note?: "...",
 *     website_url?: "",     // honeypot
 *     elapsedMs?: 4500,     // timing guard
 *   }
 */
import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX = { name: 120, email: 160, size: 10, address: 400, note: 1000 }

function clean(s: unknown, max: number): string {
  if (typeof s !== 'string') return ''
  return s.trim().slice(0, max)
}
function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}
function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  // Honeypot
  if (typeof body?.website_url === 'string' && body.website_url.trim().length > 0) {
    return NextResponse.json({ ok: true, id: 'ignored' }, { status: 200 })
  }
  // Timing guard — humans take >2s to fill a 3-field form
  if (typeof body?.elapsedMs === 'number' && body.elapsedMs < 2000) {
    return NextResponse.json({ ok: true, id: 'ignored' }, { status: 200 })
  }

  const productId = clean(body?.productId, 160)
  const email = clean(body?.email, MAX.email).toLowerCase()
  const name = clean(body?.name, MAX.name)
  const size = clean(body?.size, MAX.size)
  const address = clean(body?.shippingAddress, MAX.address)
  const note = clean(body?.note, MAX.note)
  const quantityRaw = Number(body?.quantity)
  const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 && quantityRaw <= 10
    ? Math.floor(quantityRaw)
    : 1

  if (!productId) {
    return NextResponse.json({ ok: false, error: 'Missing product.' }, { status: 400 })
  }
  if (!name) {
    return NextResponse.json({ ok: false, error: 'Vänligen fyll i ditt namn.' }, { status: 400 })
  }
  if (!email || !isEmail(email)) {
    return NextResponse.json({ ok: false, error: 'Vänligen ange en giltig e-postadress.' }, { status: 400 })
  }

  // Sanity config — same env vars as sponsor-lead + cron use.
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const token = process.env.SANITY_API_WRITE_TOKEN
  if (!projectId || !token) {
    console.error('[reservation] Sanity write env missing', {
      hasProjectId: !!projectId,
      hasToken: !!token,
    })
    return NextResponse.json(
      { ok: false, error: 'Serverkonfiguration saknas. Maila oss på mba.malmo.basket@gmail.com.' },
      { status: 500 },
    )
  }
  const client = createClient({ projectId, dataset, apiVersion: '2024-01-01', token, useCdn: false })

  // Fetch the product snapshot — we record name/price/sourceUrl at
  // reservation time so historical reservations stay accurate even if the
  // product is later edited or deleted.
  let product: any = null
  try {
    product = await client.fetch(
      `*[_type=="dropshipProduct" && _id == $id][0]{_id, name, priceSek, sourceUrl}`,
      { id: productId },
    )
  } catch (err: any) {
    console.error('[reservation] Sanity fetch failed', err?.message || err)
  }
  if (!product) {
    return NextResponse.json({ ok: false, error: 'Produkten finns inte längre.' }, { status: 404 })
  }

  const userAgent = req.headers.get('user-agent')?.slice(0, 400) || ''
  const doc = {
    _type: 'reservation',
    status: 'new',
    createdAt: new Date().toISOString(),
    product: { _type: 'reference', _ref: product._id },
    productName: product.name,
    productPriceSek: product.priceSek,
    productSourceUrl: product.sourceUrl,
    customerEmail: email,
    customerName: name,
    size: size || undefined,
    quantity,
    shippingAddress: address || undefined,
    note: note || undefined,
    userAgent,
  }

  let created: any
  try {
    created = await client.create(doc)
  } catch (err: any) {
    console.error('[reservation] Sanity create failed', err?.message || err)
    return NextResponse.json(
      { ok: false, error: 'Kunde inte spara reservationen. Försök igen.' },
      { status: 502 },
    )
  }

  // ── Email #1 — admin notification to Cris ──────────────────────────
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const adminTo = process.env.RESERVATION_NOTIFY_TO || process.env.LEAD_NOTIFY_TO || 'mba.malmo.basket@gmail.com'
    const adminFrom = process.env.RESERVATION_NOTIFY_FROM || process.env.LEAD_NOTIFY_FROM || 'orders@ifmba.se'
    const adminSubject = `🛍️ Ny reservation: ${quantity}× ${product.name}`
    const subTotalSek = (product.priceSek || 0) * quantity
    const adminHtml = `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:560px">
        <h2 style="margin:0 0 16px 0">🛍️ Ny reservation på /butik</h2>
        <table style="border-collapse:collapse;width:100%;margin-bottom:20px">
          <tr><td style="padding:6px 10px;background:#f7f6f1"><b>Produkt</b></td><td style="padding:6px 10px">${escHtml(product.name)}</td></tr>
          <tr><td style="padding:6px 10px;background:#f7f6f1"><b>Antal</b></td><td style="padding:6px 10px">${quantity}</td></tr>
          ${size ? `<tr><td style="padding:6px 10px;background:#f7f6f1"><b>Storlek</b></td><td style="padding:6px 10px">${escHtml(size)}</td></tr>` : ''}
          <tr><td style="padding:6px 10px;background:#f7f6f1"><b>Pris</b></td><td style="padding:6px 10px">${product.priceSek} kr × ${quantity} = <b>${subTotalSek} kr</b></td></tr>
        </table>
        <h3 style="margin:24px 0 8px 0">Kund</h3>
        <p style="margin:4px 0">${escHtml(name)} — <a href="mailto:${escHtml(email)}">${escHtml(email)}</a></p>
        ${address ? `<h3 style="margin:24px 0 8px 0">Leveransadress</h3><pre style="white-space:pre-wrap;font-family:inherit;background:#f7f6f1;padding:10px;border-radius:4px">${escHtml(address)}</pre>` : ''}
        ${note ? `<h3 style="margin:24px 0 8px 0">Meddelande</h3><pre style="white-space:pre-wrap;font-family:inherit;background:#f7f6f1;padding:10px;border-radius:4px">${escHtml(note)}</pre>` : ''}
        ${product.sourceUrl ? `
          <h3 style="margin:24px 0 8px 0">▶ Beställ från leverantör</h3>
          <p><a href="${escHtml(product.sourceUrl)}" style="display:inline-block;padding:12px 20px;background:#FFCB05;color:#0B1220;text-decoration:none;font-weight:800;border-radius:100px">Öppna AliExpress-listningen →</a></p>
          <p style="font-size:12px;color:#666;margin-top:4px;word-break:break-all">${escHtml(product.sourceUrl)}</p>
        ` : '<p style="color:#a00">⚠ Ingen leverantörs-URL satt på produkten.</p>'}
        <hr style="border:0;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#777;font-size:12px">Reservation #${created._id} · <a href="https://ifmba.se/studio/structure/reservation">Öppna i Studio</a></p>
      </div>
    `
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: adminFrom, to: adminTo, reply_to: email, subject: adminSubject, html: adminHtml }),
    }).catch((e) => console.warn('[reservation] Admin email failed', e?.message || e))

    // ── Email #2 — customer confirmation ────────────────────────────
    const custFrom = process.env.RESERVATION_NOTIFY_FROM || 'orders@ifmba.se'
    const custSubject = `Tack för din reservation hos MBA · ${product.name}`
    const custHtml = `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:560px">
        <h2 style="margin:0 0 8px 0">Tack ${escHtml(name)}! 🙏</h2>
        <p style="color:#444;line-height:1.55">Vi har tagit emot din reservation. Vi hör av oss inom 24 timmar med betalningsinstruktioner (Swish) och beräknad leveranstid (3–7 dagar från EU-lager).</p>
        <h3 style="margin:24px 0 8px 0">Din reservation</h3>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:6px 10px;background:#f7f6f1"><b>Produkt</b></td><td style="padding:6px 10px">${escHtml(product.name)}</td></tr>
          <tr><td style="padding:6px 10px;background:#f7f6f1"><b>Antal</b></td><td style="padding:6px 10px">${quantity}</td></tr>
          ${size ? `<tr><td style="padding:6px 10px;background:#f7f6f1"><b>Storlek</b></td><td style="padding:6px 10px">${escHtml(size)}</td></tr>` : ''}
          <tr><td style="padding:6px 10px;background:#f7f6f1"><b>Totalt</b></td><td style="padding:6px 10px"><b>${subTotalSek} kr</b></td></tr>
        </table>
        <p style="color:#444;margin-top:24px">100 % av vinsten går tillbaka till klubben — tröjor, hallhyra, resor.</p>
        <hr style="border:0;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#777;font-size:12px">Frågor? Svara på det här mejlet eller skriv till <a href="mailto:mba.malmo.basket@gmail.com">mba.malmo.basket@gmail.com</a></p>
        <p style="color:#777;font-size:12px">IFK Malmö Basket · <a href="https://ifmba.se">ifmba.se</a></p>
      </div>
    `
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: custFrom, to: email, subject: custSubject, html: custHtml }),
    }).catch((e) => console.warn('[reservation] Customer email failed', e?.message || e))
  } else {
    console.warn('[reservation] RESEND_API_KEY not set — no emails sent. Reservation safely stored in Sanity.')
  }

  return NextResponse.json({ ok: true, id: created._id }, { status: 200 })
}
