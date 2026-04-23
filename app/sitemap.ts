import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const url = 'https://www.ifmba.se'
  return [
    { url: `${url}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${url}/#news`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${url}/#standings`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${url}/#squad`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${url}/#courts`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${url}/#sponsors`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]
}
