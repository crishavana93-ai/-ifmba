/**
 * POST /api/prediction
 *
 * Fan guesses MBA vs opponent final score (+ optional top-scorer). Writes a
 * `prediction` doc in Sanity tied to the currently-open `predictionRound`.
 *
 * Server-side checks:
 *   - honeypot field `website_url` must be empty
 *   - elapsedMs (time since form mount) must be ≥ 2s (bots submit instantly)
 *   - deadline on the active round must be in the future
 *   - scores are integers 0–300
 *   - display name 1–40 chars
 */
import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX = { name: 40, email: 160, topScorer: 60 }

function asInt(x: unknown): number | null {
  const n = typeof x === 'number' ? x : typeof x === 'string' ? parseInt(x, 10) : NaN
  return Number.isFinite(n) ? n : null
}

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid body.' }, { status: 400 })
  }

  // Honeypot + timing
  if (typeof body?.website_url === 'string' && body.website_url.trim().length > 0) {
    return NextResponse.json({ ok: true, id: 'ignored' }, { status: 200 })
  }
  if (typeof body?.elapsedMs === 'number' && body.elapsedMs < 2000) {
    return NextResponse.json({ ok: true, id: 'ignored' }, { status: 200 })
  }

  const roundId = typeof body?.roundId === 'string' ? body.roundId : ''
  const name = typeof body?.displayName === 'string' ? body.displayName.trim().slice(0, MAX.name) : ''
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase().slice(0, MAX.email) : ''
  const mba = asInt(body?.mbaScore)
  const opp = asInt(body?.opponentScore)
  const top = typeof body?.topScorerGuess === 'string' ? body.topScorerGuess.trim().slice(0, MAX.topScorer) : ''

  if (!roundId) return NextResponse.json({ ok: false, error: 'Omgång saknas.' }, { status: 400 })
  if (!name)    return NextResponse.json({ ok: false, error: 'Ange ett visningsnamn.' }, { status: 400 })
  if (mba == null || mba < 0 || mba > 300) {
    return NextResponse.json({ ok: false, error: 'MBA-poäng måste vara 0–300.' }, { status: 400 })
  }
  if (opp == null || opp < 0 || opp > 300) {
    return NextResponse.json({ ok: false, error: 'Motståndarpoäng måste vara 0–300.' }, { status: 400 })
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const token = process.env.SANITY_API_WRITE_TOKEN
  if (!projectId || !token) {
    // eslint-disable-next-line no-console
    console.error('[prediction] Sanity write env missing')
    return NextResponse.json({ ok: false, error: 'Serverkonfiguration saknas.' }, { status: 500 })
  }

  const client = createClient({ projectId, dataset, apiVersion: '2024-01-01', token, useCdn: false })

  // Verify the round exists, is open, and the deadline is in the future.
  let round: any
  try {
    round = await client.fetch(
      `*[_type == "predictionRound" && _id == $id][0]{ _id, status, deadline }`,
      { id: roundId },
    )
  } catch {
    return NextResponse.json({ ok: false, error: 'Kunde inte hämta omgången.' }, { status: 502 })
  }
  if (!round) return NextResponse.json({ ok: false, error: 'Omgången finns inte.' }, { status: 404 })
  if (round.status !== 'open') {
    return NextResponse.json({ ok: false, error: 'Omgången är stängd.' }, { status: 400 })
  }
  if (round.deadline && new Date(round.deadline).getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: 'Deadline har passerat.' }, { status: 400 })
  }

  const userAgent = req.headers.get('user-agent')?.slice(0, 400) || ''
  const doc = {
    _type: 'prediction',
    round: { _type: 'reference', _ref: roundId },
    displayName: name,
    email: email || undefined,
    mbaScore: mba,
    opponentScore: opp,
    topScorerGuess: top || undefined,
    userAgent,
    createdAt: new Date().toISOString(),
  }

  let created: any
  try {
    created = await client.create(doc)
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[prediction] Sanity create failed', err?.message || err)
    return NextResponse.json({ ok: false, error: 'Kunde inte spara tippning.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, id: created._id }, { status: 200 })
}
