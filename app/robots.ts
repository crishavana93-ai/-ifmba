import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/studio', '/api'] },
    ],
    sitemap: 'https://www.ifmba.se/sitemap.xml',
    host: 'https://www.ifmba.se',
  }
}
