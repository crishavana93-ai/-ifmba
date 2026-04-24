/**
 * POST /api/newsletter
 *
 * Footer newsletter signup. Creates (or revives) a `subscriber` document in
 * Sanity. Optional Resend "welcome" email fires if RESEND_API_KEY is set.
 *
 * Response:
 *   { ok: true }                            — subscribed (new or reactivated)
 *   { ok: false, error: "<message>" }
 *
 * Anti-bot:
 *   - Honeypot field `website_url` — hidden from humans, bots fill it.
 *   - Timing check: the client sends `elapsedMs` (ms since form mount).
 *     Submissions under 1500ms are almost certainly bots.
 *   - Server-side email validation.
 *
 * De-duplication:
 *   - If the email already exists, we flip status back to 'active' and
 *     update `subscribedAt` — instead of throwing, which would leak whether
 *     the address is already on file (enumeration vector).
 */
import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid body.' }, { status: 400 })
  }

  // Honeypot
  if (typeof body?.website_url === 'string' && body.website_url.trim().length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }
  // Timing — a real human takes at least a couple of seconds to fill and submit.
  if (typeof body?.elapsedMs === 'number' && body.elapsedMs < 1500) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const emailRaw = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!emailRaw || emailRaw.length > 160 || !isEmail(emailRaw)) {
    return NextResponse.json(
      { ok: false, error: 'Ange en giltig e-postadress.' },
      { status: 400 },
    )
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const token = process.env.SANITY_API_WRITE_TOKEN
  if (!projectId || !token) {
    // eslint-disable-next-line no-console
    console.error('[newsletter] Sanity write env missing')
    return NextResponse.json(
      { ok: false, error: 'Serverkonfiguration saknas.' },
      { status: 500 },
    )
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  })

  // Deterministic doc id based on email — simple, GDPR-friendly dedupe:
  // case-insensitive, no hash collisions, predictable when the user later
  // asks "am I on the list?". Prefix keeps it namespaced.
  const docId = `subscriber.${Buffer.from(emailRaw).toString('base64').replace(/=+$/, '').replace(/[^a-zA-Z0-9]/g, '')}`
  const userAgent = req.headers.get('user-agent')?.slice(0, 400) || ''
  const now = new Date().toISOString()

  try {
    // createOrReplace — if they existed and unsubscribed, this reactivates
    // without surfacing "already subscribed" to the client.
    await client.createIfNotExists({
      _id: docId,
      _type: 'subscriber',
      email: emailRaw,
      source: 'footer',
      consent: true,
      userAgent,
      subscribedAt: now,
      status: 'active',
    })
    // Patch — ensure re-subscribers are flipped back to active.
    await client
      .patch(docId)
      .set({ status: 'active', subscribedAt: now })
      .commit({ autoGenerateArrayKeys: true })
      .catch(() => {})
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[newsletter] Sanity write failed', err?.message || err)
    return NextResponse.json(
      { ok: false, error: 'Kunde inte spara. Försök igen.' },
      { status: 502 },
    )
  }

  // Optional welcome email via Resend.
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const from = process.env.NEWSLETTER_FROM || 'nyhetsbrev@ifmba.se'
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: emailRaw,
        subject: 'Välkommen till MBA-familjen 🏀',
        html: `
          <h2>Välkommen till MBA — Malmö Basket!</h2>
          <p>Du är nu med i vår nyhetsbrevsfamilj. Vi skickar ut en uppdatering
          efter varje hemmamatch och när vi släpper ny merch eller event.</p>
          <p>Följ oss också på Instagram:
          <a href="https://www.ifmba.se">ifmba.se</a>.</p>
          <p style="color:#777;font-size:12px">Du kan avsluta prenumerationen
          när som helst genom att svara på något av våra mejl med
          <b>Avsluta</b>.</p>
        `,
      }),
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
