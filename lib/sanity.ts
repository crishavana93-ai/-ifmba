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
  players: `*[_type == "player" && active == true] | order(number asc){
    _id, number, firstName, lastName, position, nationality, flag, quote, active,
    "photoUrl": photo.asset->url
  }`,
  standings: `*[_type == "standing"] | order(position asc){
    _id, team, shortName, wins, losses, points, position, isUs, series
  }`,
  fixtures: `*[_type == "match" && played == false] | order(date asc)[0...5]`,
  results: `*[_type == "match" && played == true] | order(date desc)[0...5]{..., topScorer->{firstName, lastName, number}}`,
  courts: `*[_type == "court"]`,
  sponsors: `*[_type == "sponsor" && active == true] | order(tier asc)`,
  news: `*[_type == "newsPost"] | order(publishedAt desc)[0...6]{title, slug, coverImage, tag, publishedAt}`,

  // Prediction — the single currently-open round (if any). Closed/final rounds
  // power the leaderboard below.
  predictionActive: `*[_type == "predictionRound" && status == "open"] | order(matchDate asc)[0]{
    _id, matchup, matchDate, deadline, status
  }`,
  predictionLatestFinal: `*[_type == "predictionRound" && status == "final"] | order(matchDate desc)[0]{
    _id, matchup, matchDate, finalMbaScore, finalOpponentScore, topScorerActual,
    "entries": *[_type == "prediction" && references(^._id)] | order(coalesce(points, 0) desc)[0...10]{
      _id, displayName, mbaScore, opponentScore, topScorerGuess, points
    }
  }`,
  settings: `*[_type == "siteSettings"][0]{
    ...,
    spotlightPlayer->{
      _id, firstName, lastName, number, position, nationality, flag,
      "photoUrl": photo.asset->url
    }
  }`,

  // Media assets — photos and videos uploaded via the Sanity Studio "Media" tab.
  // Each row returns `url` for direct <img src> / <video src> use, plus metadata.
  mediaAll: `*[_type == "mediaAsset" && active == true] | order(coalesce(order, 0) desc, takenAt desc){
    _id, kind, category, placement, title, captionSv, captionEn, credit, takenAt,
    "imageUrl": image.asset->url,
    "videoUrl": video.asset->url,
    "posterUrl": poster.asset->url
  }`,
  mediaByCategory: (cat: string) => `*[_type == "mediaAsset" && active == true && category == "${cat}"] | order(coalesce(order, 0) desc, takenAt desc){
    _id, kind, category, placement, title, captionSv, captionEn, credit, takenAt,
    "imageUrl": image.asset->url,
    "videoUrl": video.asset->url,
    "posterUrl": poster.asset->url
  }`,
  mediaByPlacement: (slot: string) => `*[_type == "mediaAsset" && active == true && placement == "${slot}"] | order(_updatedAt desc)[0]{
    _id, kind, category, placement, title, captionSv, captionEn,
    "imageUrl": image.asset->url,
    "videoUrl": video.asset->url,
    "posterUrl": poster.asset->url
  }`,

  // Sweden News — curated headlines from SBBF / leagues / Skåne / FIBA.
  // Prefer a manually uploaded image over the auto-scraped og:image URL.
  swedenNews: `*[_type == "swedenNews" && active == true] | order(publishedAt desc)[0...24]{
    _id, headline, summary, source, sourceName, url, publishedAt, imageUrl,
    "uploadedImageUrl": image.asset->url,
    "image": image
  }`,
}
