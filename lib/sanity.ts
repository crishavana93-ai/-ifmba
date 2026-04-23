import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

if (!projectId) {
  // Don't throw at module load — that kills the Vercel build during page
  // data collection with a cryptic stack. Log and let queries no-op instead.
  // eslint-disable-next-line no-console
  console.warn(
    '[sanity] NEXT_PUBLIC_SANITY_PROJECT_ID is not set. ' +
      'Sanity queries will return empty results until this is configured ' +
      'in the deployment environment variables.',
  )
}

export const client = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2024-01-01',
      useCdn: true,
    })
  : null

const builder = client ? imageUrlBuilder(client) : null
export function urlFor(source: any) {
  if (!builder) {
    return { url: () => '', width: () => ({ url: () => '' }), height: () => ({ url: () => '' }) } as any
  }
  return builder.image(source)
}

// Safe fetch wrapper — returns [] / null when Sanity isn't configured,
// so static page generation doesn't blow up on unconfigured preview deploys.
export async function safeFetch<T>(query: string, fallback: T): Promise<T> {
  if (!client) return fallback
  try {
    return (await client.fetch<T>(query)) ?? fallback
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[sanity] fetch failed:', (err as Error)?.message)
    return fallback
  }
}

// ═══ QUERIES ═══
export const QUERIES = {
  players: `*[_type == "player" && active == true] | order(number asc)`,
  standings: `*[_type == "standing"] | order(position asc)`,
  fixtures: `*[_type == "match" && played == false] | order(date asc)[0...5]`,
  results: `*[_type == "match" && played == true] | order(date desc)[0...5]{..., topScorer->{firstName, lastName, number}}`,
  courts: `*[_type == "court"]`,
  sponsors: `*[_type == "sponsor" && active == true] | order(tier asc)`,
  news: `*[_type == "newsPost"] | order(publishedAt desc)[0...6]{title, slug, coverImage, tag, publishedAt}`,
  settings: `*[_type == "siteSettings"][0]{..., spotlightPlayer->{firstName, lastName, number, position, nationality, flag, photo}}`,
}
