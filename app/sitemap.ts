import type { MetadataRoute } from 'next'
import { safeFetch } from '@/lib/sanity'

// Revalidate the sitemap hourly so new articles surface without a redeploy.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const url = 'https://www.ifmba.se'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${url}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${url}/butik`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${url}/donera`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${url}/partners`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${url}/anslut`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${url}/nyheter`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${url}/hallar`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    // Fragment URLs (/#news …) removed 2026-08-01 — invalid in sitemaps,
    // Google strips them into duplicate "/" entries.
    { url: `${url}/integritetspolicy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // News article pages (SEO 2026-08-23): previously missing from the sitemap,
  // so Google only found articles by crawling from /nyheter. safeFetch returns
  // [] when Sanity is unreachable — sitemap degrades to static routes.
  const posts = await safeFetch<{ slug?: string; publishedAt?: string }[]>(
    `*[_type == "newsPost" && defined(slug.current)]{ "slug": slug.current, publishedAt }`,
    [],
  )
  const newsRoutes: MetadataRoute.Sitemap = (posts || [])
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${url}/nyheter/${p.slug}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    }))

  return [...staticRoutes, ...newsRoutes]
}
