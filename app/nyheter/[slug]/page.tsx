/**
 * /nyheter/[slug] — single article detail page for MBA News Posts.
 *
 * Renders the full body (Portable Text blocks + inline images) with a hero
 * cover, tag pill, publish date, and link back to /nyheter. Falls back to
 * 404 if the slug doesn't match a published post.
 *
 * We do a lightweight inline render of the Portable Text block shape rather
 * than importing `@portabletext/react` — keeps the build dependency surface
 * minimal and avoids a package install step during sync-and-deploy.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { safeFetch, QUERIES, urlFor } from '@/lib/sanity'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollProgress from '@/components/ScrollProgress'
import BackToTop from '@/components/BackToTop'

export const revalidate = 60

type NewsPost = {
  _id: string
  title: string
  slug?: { current: string }
  body?: any[]
  coverImage?: any
  tag?: string
  publishedAt?: string
}

const POST_QUERY = (slug: string) =>
  `*[_type == "newsPost" && slug.current == "${slug.replace(/"/g, '')}"][0]{
    _id, title, slug, body, coverImage, tag, publishedAt
  }`

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await safeFetch<NewsPost | null>(POST_QUERY(slug), null)
  if (!post) return { title: 'Nyhet — MBA' }
  return {
    title: `${post.title} — MBA · Malmö Basket`,
    description: post.title,
    alternates: { canonical: `/nyheter/${slug}` },
    openGraph: {
      title: post.title,
      type: 'article',
      publishedTime: post.publishedAt,
      images: post.coverImage
        ? [{ url: urlFor(post.coverImage).width(1200).height(630).fit('crop').url() }]
        : undefined,
    },
  }
}

function formatDate(iso?: string) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

/**
 * Tiny inline Portable Text renderer. Supports:
 *  - text blocks (h1/h2/h3 via style; normal paragraphs)
 *  - marks: strong, em, link
 *  - inline images (type === 'image')
 *  - bullet / numbered lists
 * Anything else falls back to rendering the block's plain text.
 */
function renderMark(child: any, key: string, marksDef: any[] = []): any {
  if (!child.marks || child.marks.length === 0) return child.text
  let node: any = child.text
  for (const mark of child.marks) {
    if (mark === 'strong') node = <strong key={key + mark}>{node}</strong>
    else if (mark === 'em') node = <em key={key + mark}>{node}</em>
    else {
      const def = marksDef.find((d: any) => d._key === mark)
      if (def?._type === 'link' && def.href) {
        node = (
          <a key={key + mark} href={def.href} target="_blank" rel="noopener">
            {node}
          </a>
        )
      }
    }
  }
  return node
}

function renderBlock(block: any, i: number): any {
  if (!block) return null

  // Inline image
  if (block._type === 'image' && block.asset) {
    const src = urlFor(block).width(1600).url()
    return (
      <figure className="article-figure" key={block._key || i}>
        <img src={src} alt={block.alt || ''} />
        {block.caption && <figcaption>{block.caption}</figcaption>}
      </figure>
    )
  }

  // Text block
  if (block._type === 'block') {
    const style = block.style || 'normal'
    const children = (block.children || []).map((c: any, ci: number) =>
      renderMark(c, `${block._key || i}-${ci}`, block.markDefs || []),
    )

    if (style === 'h1') return <h1 key={block._key || i}>{children}</h1>
    if (style === 'h2') return <h2 key={block._key || i}>{children}</h2>
    if (style === 'h3') return <h3 key={block._key || i}>{children}</h3>
    if (style === 'blockquote')
      return <blockquote key={block._key || i}>{children}</blockquote>
    return <p key={block._key || i}>{children}</p>
  }

  return null
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [post, settings] = await Promise.all([
    safeFetch<NewsPost | null>(POST_QUERY(slug), null),
    safeFetch<any>(QUERIES.settings, null),
  ])

  if (!post) notFound()

  const heroUrl = post.coverImage
    ? urlFor(post.coverImage).width(1920).height(900).fit('crop').url()
    : null

  return (
    <>
      <ScrollProgress />
      <BackToTop />
      <Navbar />

      <article className="article">
        {heroUrl && (
          <div className="article-hero">
            <img src={heroUrl} alt={post.title} />
            <div className="article-hero-scrim" />
          </div>
        )}

        <div className="contain article-inner">
          <Link href="/nyheter" className="article-back">
            ← Alla nyheter
          </Link>
          {post.tag && <span className="article-tag">{post.tag}</span>}
          <h1 className="article-title">{post.title}</h1>
          <div className="article-meta">
            <span>{formatDate(post.publishedAt)}</span>
            <span className="dot" />
            <span>MBA · Malmö Basket</span>
          </div>

          <div className="article-body">
            {post.body && post.body.length > 0 ? (
              post.body.map((b: any, i: number) => renderBlock(b, i))
            ) : (
              <p>Artikeln saknar ännu text. Redaktionen uppdaterar via /studio.</p>
            )}
          </div>

          <div className="article-foot">
            <Link href="/nyheter" className="btn-cta">
              ← Till alla nyheter
            </Link>
          </div>
        </div>
      </article>

      <Footer settings={settings} />
    </>
  )
}
