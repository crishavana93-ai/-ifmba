import Link from 'next/link'
import { urlFor } from '@/lib/sanity'

/**
 * News — the consolidated news block on the homepage.
 *
 * Shows MBA's own News Posts + curated Swedish basketball items (from the
 * `swedenNews` schema). Each card links to a full article page:
 *   - MBA posts  → /nyheter/{slug}
 *   - External   → the original URL (opens new tab)
 *
 * The old SwedenNews landing section was removed per request; this is now
 * the single news block on home.
 */

type NewsPost = {
  _id?: string
  title: string
  slug?: { current: string }
  coverImage?: any
  tag?: string
  publishedAt?: string
}

type SwedenNewsItem = {
  _id?: string
  headline: string
  summary?: string
  source?: string
  sourceName?: string
  url?: string
  publishedAt?: string
  image?: any
}

function formatDate(iso?: string) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

type UnifiedItem = {
  id: string
  title: string
  tag: string
  date?: string
  imgUrl: string | null
  href: string
  external: boolean
}

export default function News({
  news = [] as NewsPost[],
  swedenNews = [] as SwedenNewsItem[],
  num,
  numText,
  className,
}: {
  news?: NewsPost[]
  swedenNews?: SwedenNewsItem[]
  num?: string
  numText?: string
  className?: string
}) {
  const own: UnifiedItem[] = news.map((post, i) => ({
    id: post._id || post.slug?.current || `own-${i}`,
    title: post.title,
    tag: post.tag || 'MBA',
    date: post.publishedAt,
    imgUrl: post.coverImage
      ? urlFor(post.coverImage).width(800).height(500).fit('crop').url()
      : null,
    href: post.slug?.current ? `/nyheter/${post.slug.current}` : '/nyheter',
    external: false,
  }))

  const curated: UnifiedItem[] = swedenNews.map((item, i) => ({
    id: item._id || `ext-${i}`,
    title: item.headline,
    tag: item.sourceName || item.source || 'SBBF',
    date: item.publishedAt,
    imgUrl: item.image ? urlFor(item.image).width(800).height(500).fit('crop').url() : null,
    href: item.url || '/nyheter',
    external: !!item.url,
  }))

  // MBA's own news first, then curated. Limit to 6 on homepage.
  const combined = [...own, ...curated].slice(0, 6)

  return (
    <section
      className={`news section ${className || ''}`.trim()}
      data-num={num}
      data-num-text={numText}
      id="news"
    >
      <div className="contain">
        <div className="news-head">
          <div>
            <div className="label r">Senaste</div>
            <h2 className="title r">
              Nyheter <em>& Stories</em>
            </h2>
          </div>
          <Link className="news-head-link r" href="/nyheter">
            Alla nyheter →
          </Link>
        </div>

        {combined.length === 0 ? (
          <div className="news-empty r">
            Inga nyheter ännu — snart dags för tip-off.
          </div>
        ) : (
          <div className="news-grid r">
            {combined.map((item) => {
              const CardBody = (
                <>
                  <div className="news-card-img">
                    {item.imgUrl ? (
                      <img src={item.imgUrl} alt={item.title} />
                    ) : (
                      <div className="news-card-placeholder">MBA</div>
                    )}
                    {item.tag && <span className="news-card-tag">{item.tag}</span>}
                  </div>
                  <div className="news-card-body">
                    <h3 className="news-card-title">{item.title}</h3>
                    <div className="news-card-meta">
                      <span>{formatDate(item.date)}</span>
                      <span className="dot" />
                      <span>{item.tag}</span>
                    </div>
                  </div>
                </>
              )
              return item.external ? (
                <a
                  key={item.id}
                  className="news-card"
                  href={item.href}
                  target="_blank"
                  rel="noopener"
                >
                  {CardBody}
                </a>
              ) : (
                <Link key={item.id} className="news-card" href={item.href}>
                  {CardBody}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
