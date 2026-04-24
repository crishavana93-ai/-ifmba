/**
 * Swedish basketball RSS ingestion.
 *
 * Pulls headlines from:
 *   - basket.se/feed/              (SBBF / Svenska Basketbollförbundet)
 *   - svt.se/sport/basket/rss.xml  (SVT Sport — basket section)
 *
 * Dedupes by URL, then upserts into the `swedenNews` Sanity schema so the
 * existing /nyheter + home News block render them without code changes.
 *
 * Called by /api/ingest-news, which in turn is hit by a Vercel Cron trigger
 * (see vercel.json) every 30 minutes. Manually re-runnable too — useful when
 * seeding a new deployment.
 *
 * ENV required:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET  (defaults to production)
 *   SANITY_API_WRITE_TOKEN      (server-only; create a token with "Editor"
 *                                permission in Sanity → Manage → API)
 */

export const FEEDS: Array<{
  source: 'sbbf' | 'liga' | 'skane' | 'fiba'
  sourceName: string
  url: string
}> = [
  { source: 'sbbf', sourceName: 'SBBF · basket.se', url: 'https://www.basket.se/feed/' },
  { source: 'liga', sourceName: 'SVT Sport · Basket', url: 'https://www.svt.se/sport/basket/rss.xml' },
]

// Basketball keywords for filtering SVT's sport feed (it's broad) — keep
// anything that mentions basket, NBA, landslag, division, etc.
const BASKET_KEYWORDS =
  /basket|nba|wnba|basketligan|damligan|landslag|euroleague|fiba|div\s?[0-9]/i

type ParsedItem = {
  source: 'sbbf' | 'liga' | 'skane' | 'fiba'
  sourceName: string
  headline: string
  summary?: string
  url: string
  publishedAt: string // ISO
}

function stripTags(s: string) {
  return s
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function extractTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const m = block.match(re)
  return m ? stripTags(m[1]) : ''
}

function isoDate(raw: string): string {
  if (!raw) return new Date().toISOString()
  const d = new Date(raw)
  if (isNaN(d.getTime())) return new Date().toISOString()
  return d.toISOString()
}

/**
 * Minimal RSS parser — no external dep. Handles <item>…</item> blocks for
 * RSS 2.0 (basket.se, svt.se). Extracts title, link, description, pubDate.
 */
export function parseRss(
  xml: string,
  source: ParsedItem['source'],
  sourceName: string,
): ParsedItem[] {
  const items: ParsedItem[] = []
  const itemRe = /<item\b[^>]*>([\s\S]*?)<\/item>/gi
  let m: RegExpExecArray | null
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1]
    const title = extractTag(block, 'title')
    const link = extractTag(block, 'link')
    const desc = extractTag(block, 'description')
    const pubDate = extractTag(block, 'pubDate') || extractTag(block, 'dc:date')
    if (!title || !link) continue
    items.push({
      source,
      sourceName,
      headline: title.slice(0, 140),
      summary: desc ? desc.slice(0, 320) : undefined,
      url: link,
      publishedAt: isoDate(pubDate),
    })
  }
  return items
}

/**
 * Fetch all configured feeds in parallel, parse, then filter & dedupe.
 */
export async function fetchAllFeeds(): Promise<ParsedItem[]> {
  const all: ParsedItem[] = []
  const settled = await Promise.allSettled(
    FEEDS.map(async (f) => {
      const res = await fetch(f.url, {
        headers: { 'User-Agent': 'MBA-Malmö-Basket/1.0 (ifmba.se RSS aggregator)' },
        // No Next cache — we want fresh each cron hit
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`${f.url} → HTTP ${res.status}`)
      const xml = await res.text()
      return parseRss(xml, f.source, f.sourceName)
    }),
  )
  for (const s of settled) {
    if (s.status === 'fulfilled') all.push(...s.value)
  }

  // Filter SVT items (broad sports feed) to just basketball-relevant ones.
  const filtered = all.filter((it) => {
    if (it.source === 'sbbf') return true // federation feed is already basket-only
    return BASKET_KEYWORDS.test(it.headline) || BASKET_KEYWORDS.test(it.summary || '')
  })

  // Dedupe by URL
  const seen = new Set<string>()
  const deduped: ParsedItem[] = []
  for (const it of filtered) {
    if (seen.has(it.url)) continue
    seen.add(it.url)
    deduped.push(it)
  }

  // Keep the 40 newest overall — plenty for the feed, not enough to spam Sanity
  deduped.sort((a, b) => (a.publishedAt > b.publishedAt ? -1 : 1))
  return deduped.slice(0, 40)
}

/**
 * Stable deterministic doc ID from URL so re-runs overwrite rather than duplicate.
 * Sanity doc IDs must match ^[a-zA-Z0-9._-]+$ and be ≤ 128 chars.
 */
export function idFromUrl(url: string): string {
  const base = url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
  return `rss-${base}`
}

/**
 * Push items into Sanity via the HTTP `mutate` endpoint (no @sanity/client dep).
 * Uses `createOrReplace` so re-ingesting the same URL is idempotent — the
 * editorial team's manual edits in Studio will be overwritten on next cron,
 * which is the desired behavior for a syndication feed.
 */
export async function upsertToSanity(items: ParsedItem[]): Promise<{
  total: number
  written: number
  skipped: number
  errors: string[]
}> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const token = process.env.SANITY_API_WRITE_TOKEN

  if (!projectId || !token) {
    return {
      total: items.length,
      written: 0,
      skipped: items.length,
      errors: [
        !projectId ? 'NEXT_PUBLIC_SANITY_PROJECT_ID missing' : '',
        !token ? 'SANITY_API_WRITE_TOKEN missing' : '',
      ].filter(Boolean),
    }
  }

  const mutations = items.map((it) => ({
    createOrReplace: {
      _id: idFromUrl(it.url),
      _type: 'swedenNews',
      headline: it.headline,
      summary: it.summary || '',
      source: it.source,
      sourceName: it.sourceName,
      url: it.url,
      publishedAt: it.publishedAt.slice(0, 10), // schema uses `date`, not datetime
      active: true,
    },
  }))

  if (mutations.length === 0) {
    return { total: 0, written: 0, skipped: 0, errors: [] }
  }

  const endpoint = `https://${projectId}.api.sanity.io/v2024-01-01/data/mutate/${dataset}`
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mutations }),
    })
    if (!res.ok) {
      const errText = await res.text()
      return {
        total: items.length,
        written: 0,
        skipped: items.length,
        errors: [`Sanity mutate HTTP ${res.status}: ${errText.slice(0, 300)}`],
      }
    }
    return { total: items.length, written: items.length, skipped: 0, errors: [] }
  } catch (e: any) {
    return {
      total: items.length,
      written: 0,
      skipped: items.length,
      errors: [`fetch failed: ${e?.message || String(e)}`],
    }
  }
}
