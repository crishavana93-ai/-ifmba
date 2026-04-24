/**
 * POST /api/ingest-news
 *
 * Secured RSS ingestion endpoint. Called by Vercel Cron every 30 minutes
 * (see vercel.json) to pull fresh basketball headlines from SBBF + SVT
 * and write them into the swedenNews Sanity schema.
 *
 * Also supports GET for manual debugging in a browser, but both verbs require
 * an `Authorization: Bearer <CRON_SECRET>` header. Vercel Cron adds that
 * header automatically when env var CRON_SECRET is set in project settings.
 *
 * Response shape:
 *   { ok: boolean, fetched: number, written: number, skipped: number, errors: string[] }
 */
import { NextResponse } from 'next/server'
import { fetchAllFeeds, upsertToSanity } from '@/lib/rss-ingest'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function handle(req: Request) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization') || ''
  const ok = secret && auth === `Bearer ${secret}`

  if (!ok) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized — set CRON_SECRET and pass Bearer token.' },
      { status: 401 },
    )
  }

  try {
    const items = await fetchAllFeeds()
    const result = await upsertToSanity(items)
    return NextResponse.json(
      {
        ok: result.errors.length === 0,
        fetched: items.length,
        written: result.written,
        skipped: result.skipped,
        errors: result.errors,
        sample: items.slice(0, 3).map((i) => ({
          source: i.source,
          headline: i.headline,
          url: i.url,
          publishedAt: i.publishedAt,
        })),
      },
      { status: 200 },
    )
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'ingest failed' },
      { status: 500 },
    )
  }
}

export const GET = handle
export const POST = handle
