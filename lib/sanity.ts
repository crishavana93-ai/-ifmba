import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(client)
export function urlFor(source: any) {
  return builder.image(source)
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
