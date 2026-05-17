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
    { url: `${url}/#news`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${url}/#standings`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${url}/#squad`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ]
}
