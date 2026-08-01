import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const url = 'https://www.ifmba.se'
  return [
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
}
