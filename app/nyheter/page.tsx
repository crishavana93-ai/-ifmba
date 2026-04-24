/**
 * /nyheter — full news archive page.
 *
 * Lists MBA's own News Posts (clickable to /nyheter/{slug}) and curated
 * Swedish basketball news (external link-outs). Paginated client-side
 * via a simple show-more toggle — good enough for the club's scale.
 */
import Link from 'next/link'
import type { Metadata } from 'next'
import { safeFetch, QUERIES, urlFor } from '@/lib/sanity'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollProgress from '@/components/ScrollProgress'
import BackToTop from '@/components/BackToTop'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Nyheter — MBA · Malmö Basket',
  description:
    'Alla nyheter och reportage från MBA samt kurerad svensk basket-nyhetsström från SBBF, SVT Sport och FIBA.',
  alternates: { canonical: '/nyheter' },
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

export default async function NyheterPage() {
  const [news, swedenNews, settings] = await Promise.all([
    safeFetch<any[]>(QUERIES.news, []),
    safeFetch<any[]>(QUERIES.swedenNews, []),
    safeFetch<any>(QUERIES.settings, null),
  ])

  return (
    <>
      <ScrollProgress />
      <BackToTop />
      <Navbar />

      <main className="page-hero section section-dark">
        <div className="contain">
          <div className="label r v">Arkiv</div>
          <h1 className="title r v" style={{ marginBottom: '18px' }}>
            Alla <em>nyheter</em>
          </h1>
          <p className="page-lede r v">
            MBA:s egna reportage plus kurerade basketnyheter från{' '}
            <a
              className="page-lede-link"
              href="https://www.basket.se"
              target="_blank"
              rel="noopener"
            >
              SBBF
            </a>
            ,{' '}
            <a
              className="page-lede-link"
              href="https://www.svt.se/sport/basket/"
              target="_blank"
              rel="noopener"
            >
              SVT Sport
            </a>{' '}
            och{' '}
            <a
              className="page-lede-link"
              href="https://www.fiba.basketball"
              target="_blank"
              rel="noopener"
            >
              FIBA
            </a>
            .
          </p>
        </div>
      </main>

      {/* MBA own — Feature grid */}
      <section className="section section-alt">
        <div className="contain">
          <div className="label r v">MBA</div>
          <h2 className="title r v" style={{ marginBottom: '32px' }}>
            Från <em>klubben</em>
          </h2>

          {news.length === 0 ? (
            <div className="news-empty r v">
              Inga egna inlägg än — redaktionen publicerar via /studio.
            </div>
          ) : (
            <div className="news-grid r v">
              {news.map((post: any) => {
                const imgUrl = post.coverImage
                  ? urlFor(post.coverImage).width(800).height(500).fit('crop').url()
                  : null
                const href = post.slug?.current
                  ? `/nyheter/${post.slug.current}`
                  : '/nyheter'
                return (
                  <Link
                    key={post._id}
                    className="news-card"
                    href={href}
                  >
                    <div className="news-card-img">
                      {imgUrl ? (
                        <img src={imgUrl} alt={post.title} />
                      ) : (
                        <div className="news-card-placeholder">MBA</div>
                      )}
                      {post.tag && (
                        <span className="news-card-tag">{post.tag}</span>
                      )}
                    </div>
                    <div className="news-card-body">
                      <h3 className="news-card-title">{post.title}</h3>
                      <div className="news-card-meta">
                        <span>{formatDate(post.publishedAt)}</span>
                        {post.tag && (
                          <>
                            <span className="dot" />
                            <span>{post.tag}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Curated Swedish basketball news */}
      <section className="section section-dark">
        <div className="contain">
          <div className="label r v">Runt om Sverige</div>
          <h2 className="title r v" style={{ marginBottom: '32px' }}>
            Svensk basket <em>just nu</em>
          </h2>

          {swedenNews.length === 0 ? (
            <div className="news-empty r v">
              Inga curerade rubriker ännu. Redaktionen lägger till via /studio.
            </div>
          ) : (
            <div className="news-grid r v">
              {swedenNews.map((item: any) => {
                const imgUrl = item.image
                  ? urlFor(item.image).width(800).height(500).fit('crop').url()
                  : null
                return (
                  <a
                    key={item._id}
                    className="news-card"
                    href={item.url || '#'}
                    target="_blank"
                    rel="noopener"
                  >
                    <div className="news-card-img">
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.headline} />
                      ) : (
                        <div className="news-card-placeholder">
                          {item.sourceName || item.source || 'SBBF'}
                        </div>
                      )}
                      <span className="news-card-tag">
                        {item.sourceName || item.source || 'SBBF'}
                      </span>
                    </div>
                    <div className="news-card-body">
                      <h3 className="news-card-title">{item.headline}</h3>
                      {item.summary && (
                        <p className="news-card-summary">{item.summary}</p>
                      )}
                      <div className="news-card-meta">
                        <span>{formatDate(item.publishedAt)}</span>
                        <span className="dot" />
                        <span>Extern länk ↗</span>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Footer settings={settings} />
    </>
  )
}
