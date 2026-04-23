import { urlFor } from '@/lib/sanity'

type NewsPost = {
  _id?: string
  title: string
  slug?: { current: string }
  coverImage?: any
  tag?: string
  publishedAt?: string
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

export default function News({ news = [] as NewsPost[], num, numText, className }: { news?: NewsPost[]; num?: string; numText?: string; className?: string }) {
  return (
    <section className={`news section ${className || ''}`.trim()} data-num={num} data-num-text={numText} id="news">
      <div className="contain">
        <div className="news-head">
          <div>
            <div className="label r">Senaste</div>
            <h2 className="title r">Nyheter <em>& Stories</em></h2>
          </div>
          <a className="news-head-link r" href="#news">Alla nyheter</a>
        </div>

        {news.length === 0 ? (
          <div className="news-empty r">
            Inga nyheter ännu — snart dags för tip-off.
          </div>
        ) : (
          <div className="news-grid r">
            {news.map((post, i) => {
              const imgUrl = post.coverImage
                ? urlFor(post.coverImage).width(800).height(500).fit('crop').url()
                : null
              return (
                <article key={post._id || post.slug?.current || i} className="news-card">
                  <div className="news-card-img">
                    {imgUrl ? (
                      <img src={imgUrl} alt={post.title} />
                    ) : (
                      <div className="news-card-placeholder">MBA</div>
                    )}
                    {post.tag && <span className="news-card-tag">{post.tag}</span>}
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
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
