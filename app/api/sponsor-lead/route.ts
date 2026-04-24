/**
 * POST /api/sponsor-lead
 *
 * Receives the lead form submission from /partners, validates it, writes
 * a `sponsorLead` document in Sanity, and (optionally) emails Cris via Resend.
 *
 * Response shape:
 *   { ok: true, id: "<sanity doc id>" }
 *   { ok: false, error: "<human-readable>" }
 *
 * Security:
 *   - Honeypot field `website_url` — if any value is present, we silently
 *     accept and drop (anti-bot; real humans never fill a hidden field).
 *   - Server-side length + email validation before writing.
 *   - Sanity write uses SANITY_API_WRITE_TOKEN (same env var the news cron
 *     already uses; already configured on Vercel).
 *
 * Resend email:
 *   - Only fires if RESEND_API_KEY is set in the environment. Missing key
 *     is NOT an error — the lead still lands in Sanity, Cris just has to
 *     poll Studio until Resend is wired up.
 *   - Target mailbox: LEAD_NOTIFY_TO (fallback: mba.malmo.basket@gmail.com).
 *   - From address: LEAD_NOTIFY_FROM (fallback: leads@ifmba.se — requires
 *     the ifmba.se sender to be verified in Resend first, otherwise the
 *     email send silently fails and we just return ok:true from the write).
 */
import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX = { name: 120, company: 160, email: 160, phone: 40, message: 2000 }
const TIERS = new Set(['Platinum', 'Gold', 'Silver', 'Bronze', 'Any'])
const BUDGETS = new Set(['lt25', '25to50', '50to100', 'gt100', 'tbd'])

function clean(s: unknown, max: number): string {
  if (typeof s !== 'string') return ''
  return s.trim().slice(0, max)
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  // Honeypot — bots fill hidden fields, humans don't.
  if (typeof body?.website_url === 'string' && body.website_url.trim().length > 0) {
    // Pretend success so bots don't retry.
    return NextResponse.json({ ok: true, id: 'ignored' }, { status: 200 })
  }

  const name = clean(body?.name, MAX.name)
  const company = clean(body?.company, MAX.company)
  const email = clean(body?.email, MAX.email).toLowerCase()
  const phone = clean(body?.phone, MAX.phone)
  const message = clean(body?.message, MAX.message)
  const tierRaw = clean(body?.tier, 20)
  const budgetRaw = clean(body?.budget, 20)
  const consent = body?.consent === true

  if (!name)    return NextResponse.json({ ok: false, error: 'Vänligen fyll i namn.' }, { status: 400 })
  if (!company) return NextResponse.json({ ok: false, error: 'Vänligen fyll i företag.' }, { status: 400 })
  if (!email || !isEmail(email)) {
    return NextResponse.json({ ok: false, error: 'Vänligen ange en giltig e-postadress.' }, { status: 400 })
  }
  if (!consent) {
    return NextResponse.json({ ok: false, error: 'Samtycke krävs för att skicka.' }, { status: 400 })
  }

  const tier = TIERS.has(tierRaw) ? tierRaw : 'Any'
  const budget = BUDGETS.has(budgetRaw) ? budgetRaw : 'tbd'

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const token = process.env.SANITY_API_WRITE_TOKEN

  if (!projectId || !token) {
    // Config error — don't silently lose the lead. Log it server-side.
    // eslint-disable-next-line no-console
    console.error('[sponsor-lead] Sanity write env missing', { hasProjectId: !!projectId, hasToken: !!token })
    return NextResponse.json(
      { ok: false, error: 'Serverkonfiguration saknas. Kontakta oss direkt på mba.malmo.basket@gmail.com.' },
      { status: 500 },
    )
  }

  const client = createClient({ projectId, dataset, apiVersion: '2024-01-01', token, useCdn: false })

  const userAgent = req.headers.get('user-agent')?.slice(0, 400) || ''
  const doc = {
    _type: 'sponsorLead',
    name,
    company,
    email,
    phone: phone || undefined,
    tier,
    budget,
    message: message || undefined,
    consent,
    status: 'new',
    source: 'partners-form',
    userAgent,
    createdAt: new Date().toISOString(),
  }

  let created: any
  try {
    created = await client.create(doc)
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[sponsor-lead] Sanity create failed', err?.message || err)
    return NextResponse.json(
      { ok: false, error: 'Kunde inte spara. Försök igen eller maila oss direkt.' },
      { status: 502 },
    )
  }

  // Optional: fire an email notification via Resend. Non-blocking; if it
  // fails or isn't configured, we still return success — the lead is safe
  // in Sanity and Cris can see it at /studio.
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const to = process.env.LEAD_NOTIFY_TO || 'mba.malmo.basket@gmail.com'
    const from = process.env.LEAD_NOTIFY_FROM || 'leads@ifmba.se'
    const subject = `Ny sponsor-lead: ${company} (${tier})`
    const html = `
      <h2>Ny sponsor-lead</h2>
      <p><strong>${company}</strong> — ${name} &lt;<a href="mailto:${email}">${email}</a>&gt;</p>
      <table style="border-collapse:collapse">
        <tr><td style="padding:4px 10px"><b>Tier</b></td><td style="padding:4px 10px">${tier}</td></tr>
        <tr><td style="padding:4px 10px"><b>Budget</b></td><td style="padding:4px 10px">${budget}</td></tr>
        ${phone ? `<tr><td style="padding:4px 10px"><b>Phone</b></td><td style="padding:4px 10px">${phone}</td></tr>` : ''}
      </table>
      ${message ? `<h3>Meddelande</h3><pre style="white-space:pre-wrap;font-family:inherit">${message.replace(/</g, '&lt;')}</pre>` : ''}
      <p style="color:#777;font-size:12px">Sanity doc id: ${created._id}</p>
    `
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, reply_to: email, subject, html }),
    }).catch((e) => {
      // eslint-disable-next-line no-console
      console.warn('[sponsor-lead] Resend send failed', e?.message || e)
    })
  }

  return NextResponse.json({ ok: true, id: created._id }, { status: 200 })
}
