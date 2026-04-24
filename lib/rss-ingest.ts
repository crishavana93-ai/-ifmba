/**
 * Swedish basketball RSS ingestion.
 *
 * Pulls headlines from:
 *   - basket.se/feed/              (SBBF / Svenska Basketbollförbundet)
 *   - svt.se/sport/basket/rss.xml  (SVT Sport — basket section)
 *
 * For each new article, also fetches the page HTML once and extracts its
 * OpenGraph image (og:image) so cards on /nyheter have a real thumbnail.
 *
 * Writes are **non-destructive**: if a doc with the same ID already exists
 * (i.e. the same article URL), we skip it. Manual edits in Studio (headline
 * tweaks, uploaded image, marking active=false) are preserved across cron
 * runs. To force-refresh, delete the doc in Studio and the next run will
 * re-create it.
 *
 * Called by /api/ingest-news, triggered by Vercel Cron every 30 minutes.
 *
 * ENV required:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET   (defaults to production)
 *   SANITY_API_WRITE_TOKEN       (server-only; Editor permission)
 */

export const FEEDS: Array<{
  source: 'sbbf' | 'liga' | 'skane' | 'fiba'
  sourceName: string
  url: string
}> = [
  { source: 'sbbf', sourceName: 'SBBF · basket.se', url: 'https://www.basket.se/feed/' },
  { source: 'liga', sourceName: 'SVT Sport · Basket', url: 'https://www.svt.se/sport/basket/rss.xml' },
]

const BASKET_KEYWORDS =
  /basket|nba|wnba|basketligan|damligan|landslag|euroleague|fiba|div\s?[0-9]/i

type ParsedItem = {
  source: 'sbbf' | 'liga' | 'skane' | 'fiba'
  sourceName: string
  headline: string
  summary?: string
  url: string
  publishedAt: string
  imageUrl?: string
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

/** Pull `<enclosure url="...">` or `<media:content url="...">` or `<image><url>...</url></image>` from an RSS item block. */
function extractRssImage(block: string): string | undefined {
  const enc = block.match(/<enclosure[^>]+url="([^"]+)"/i)
  if (enc) return enc[1]
  const media = block.match(/<media:(?:content|thumbnail)[^>]+url="([^"]+)"/i)
  if (media) return media[1]
  const img = block.match(/<image[^>]*>[\s\S]*?<url>\s*([^<\s]+)\s*<\/url>/i)
  if (img) return img[1]
  // Some feeds inline an <img src> in the description HTML — grab the first one.
  const inline = block.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (inline) return inline[1]
  return undefined
}

function isoDate(raw: string): string {
  if (!raw) return new Date().toISOString()
  const d = new Date(raw)
  if (isNaN(d.getTime())) return new Date().toISOString()
  return d.toISOString()
}

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
    const feedImage = extractRssImage(block)
    if (!title || !link) continue
    items.push({
      source,
      sourceName,
      headline: title.slice(0, 140),
      summary: desc ? desc.slice(0, 320) : undefined,
      url: link,
      publishedAt: isoDate(pubDate),
      imageUrl: feedImage,
    })
  }
  return items
}

/**
 * Fetch an article's HTML and scrape its `og:image` tag. Used as a fallback
 * when the RSS feed didn't already include an image. Bounded by a 6s timeout
 * so a slow publisher can't stall the whole cron job.
 */
async function scrapeOgImage(articleUrl: string): Promise<string | undefined> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(articleUrl, {
      headers: {
        'User-Agent': 'MBA-Malmö-Basket/1.0 (ifmba.se og:image scraper)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
      cache: 'no-store',
    })
    clearTimeout(timer)
    if (!res.ok) return undefined
    // Only need the head — cap at 256KB.
    const reader = res.body?.getReader()
    if (!reader) return undefined
    const decoder = new TextDecoder()
    let html = ''
    let total = 0
    while (total < 256_000) {
      const { value, done } = await reader.read()
      if (done) break
      html += decoder.decode(value, { stream: true })
      total += value.byteLength
      if (html.includes('</head>')) break
    }
    try { reader.cancel() } catch { /* noop */ }

    const og =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
    if (!og) return undefined
    let src = og[1].trim()
    // Resolve protocol-relative + relative URLs against the article base.
    if (src.startsWith('//')) src = 'https:' + src
    if (src.startsWith('/')) {
      const u = new URL(articleUrl)
      src = `${u.origin}${src}`
    }
    return src
  } catch {
    return undefined
  }
}

export async function fetchAllFeeds(): Promise<ParsedItem[]> {
  const all: ParsedItem[] = []
  const settled = await Promise.allSettled(
    FEEDS.map(async (f) => {
      const res = await fetch(f.url, {
        headers: { 'User-Agent': 'MBA-Malmö-Basket/1.0 (ifmba.se RSS aggregator)' },
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

  const filtered = all.filter((it) => {
    if (it.source === 'sbbf') return true
    return BASKET_KEYWORDS.test(it.headline) || BASKET_KEYWORDS.test(it.summary || '')
  })

  const seen = new Set<string>()
  const deduped: ParsedItem[] = []
  for (const it of filtered) {
    if (seen.has(it.url)) continue
    seen.add(it.url)
    deduped.push(it)
  }

  deduped.sort((a, b) => (a.publishedAt > b.publishedAt ? -1 : 1))
  return deduped.slice(0, 40)
}

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
 * Check which of these doc IDs already exist in Sanity. Returns a Set of IDs
 * that are already published — we skip those on ingest to preserve manual edits.
 */
async function existingIds(ids: string[]): Promise<Set<string>> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const token = process.env.SANITY_API_WRITE_TOKEN
  if (!projectId || !token || ids.length === 0) return new Set()
  try {
    const query = encodeURIComponent(
      `*[_id in $ids]._id`,
    )
    const params = encodeURIComponent(JSON.stringify({ ids }))
    const res = await fetch(
      `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}&%24ids=${params}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
    )
    if (!res.ok) return new Set()
    const json = (await res.json()) as { result?: string[] }
    return new Set(json.result || [])
  } catch {
    return new Set()
  }
}

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

  // Skip items whose doc ID already exists — protects manual Studio edits.
  const ids = items.map((it) => idFromUrl(it.url))
  const already = await existingIds(ids)
  const toWrite = items.filter((_, i) => !already.has(ids[i]))

  if (toWrite.length === 0) {
    return { total: items.length, written: 0, skipped: items.length, errors: [] }
  }

  // Fetch og:image for any item missing a feed-level image. Keep concurrency
  // bounded (8 at a time) to be polite to publishers' servers.
  const need = toWrite.filter((it) => !it.imageUrl)
  const concurrency = 8
  for (let i = 0; i < need.length; i += concurrency) {
    const batch = need.slice(i, i + concurrency)
    await Promise.all(
      batch.map(async (it) => {
        it.imageUrl = await scrapeOgImage(it.url)
      }),
    )
  }

  const mutations = toWrite.map((it) => ({
    createIfNotExists: {
      _id: idFromUrl(it.url),
      _type: 'swedenNews',
      headline: it.headline,
      summary: it.summary || '',
      source: it.source,
      sourceName: it.sourceName,
      url: it.url,
      publishedAt: it.publishedAt.slice(0, 10),
      imageUrl: it.imageUrl || undefined,
      active: true,
    },
  }))

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
    return {
      total: items.length,
      written: toWrite.length,
      skipped: already.size,
      errors: [],
    }
  } catch (e: any) {
    return {
      total: items.length,
      written: 0,
      skipped: items.length,
      errors: [`fetch failed: ${e?.message || String(e)}`],
    }
  }
}
