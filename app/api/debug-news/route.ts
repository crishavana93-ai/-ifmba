/**
 * GET /api/debug-news
 *
 * Diagnostic endpoint for the News section. Call this from a browser at
 * https://ifmba.se/api/debug-news to see exactly why no news is showing up.
 *
 * It does NOT expose secret values — it only reports whether each required
 * env var is present (true/false) and counts docs in Sanity. Safe to leave
 * in production.
 *
 * Example response:
 *   {
 *     env: {
 *       NEXT_PUBLIC_SANITY_PROJECT_ID: true,
 *       NEXT_PUBLIC_SANITY_DATASET: "production",
 *       SANITY_API_READ_TOKEN: false,
 *       SANITY_API_WRITE_TOKEN: true,
 *       CRON_SECRET: true
 *     },
 *     sanity: { connected: true, newsPosts: 0, swedenNews: 5 },
 *     verdict: [
 *       "Sanity is connected.",
 *       "0 MBA newsPosts — author some in Studio.",
 *       "5 swedenNews items — RSS cron is working."
 *     ]
 *   }
 */
import { NextResponse } from 'next/server'
import { safeFetch } from '@/lib/sanity'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  // Which env vars are configured on Vercel?
  const env = {
    NEXT_PUBLIC_SANITY_PROJECT_ID: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    SANITY_API_READ_TOKEN: !!process.env.SANITY_API_READ_TOKEN,
    SANITY_API_WRITE_TOKEN: !!process.env.SANITY_API_WRITE_TOKEN,
    CRON_SECRET: !!process.env.CRON_SECRET,
  }

  // Count docs in Sanity (empty array if unreachable).
  const newsPosts = await safeFetch<any[]>(
    `*[_type == "newsPost"]{_id}`,
    [],
  )
  const swedenNews = await safeFetch<any[]>(
    `*[_type == "swedenNews"]{_id, active}`,
    [],
  )

  const connected = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

  // Build a plain-English verdict.
  const verdict: string[] = []
  if (!connected) {
    verdict.push('❌ NEXT_PUBLIC_SANITY_PROJECT_ID is missing on Vercel — the frontend cannot read from Sanity at all.')
  } else {
    verdict.push('✅ Sanity is reachable from the frontend.')
  }
  if (!env.SANITY_API_WRITE_TOKEN) {
    verdict.push('❌ SANITY_API_WRITE_TOKEN is missing — the RSS cron cannot write swedenNews documents.')
  }
  if (!env.CRON_SECRET) {
    verdict.push('❌ CRON_SECRET is missing — Vercel Cron calls to /api/ingest-news will return 401.')
  }
  verdict.push(
    `📰 MBA newsPost documents in Sanity: ${newsPosts.length}${newsPosts.length === 0 ? ' — author at least one at /studio so the homepage News grid has content.' : '.'}`,
  )
  const activeSweden = swedenNews.filter((d) => d.active !== false).length
  verdict.push(
    `🇸🇪 swedenNews documents in Sanity: ${swedenNews.length} total, ${activeSweden} active${swedenNews.length === 0 ? ' — cron has never succeeded. Check CRON_SECRET + SANITY_API_WRITE_TOKEN, then trigger /api/ingest-news manually with the bearer token.' : '.'}`,
  )

  return NextResponse.json(
    {
      env,
      sanity: {
        connected,
        newsPosts: newsPosts.length,
        swedenNews: swedenNews.length,
        swedenNewsActive: activeSweden,
      },
      verdict,
      docs: 'https://www.sanity.io/docs/api-versioning',
    },
    { status: 200 },
  )
}
