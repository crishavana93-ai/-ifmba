/**
 * Sanity Studio — mounted at ifmba.se/studio
 *
 * The club edits all site content here: players, matches, news, media, settings.
 * This config is consumed by:
 *   - app/studio/[[...tool]]/page.tsx  (Next.js route mount)
 *   - sanity CLI (for `npx sanity deploy` etc. if we ever want a standalone studio)
 */
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './sanity/schemaTypes'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export default defineConfig({
  name: 'mba-studio',
  title: 'MBA · Malmö Basket Amatörer',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    structureTool({
      // Custom sidebar ordering — media at the top (most common edit),
      // settings at the bottom (rarely touched).
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Media · Photos & Videos')
              .child(S.documentTypeList('mediaAsset').title('Media · Photos & Videos')),
            S.divider(),
            S.listItem()
              .title('News posts (MBA · own)')
              .child(S.documentTypeList('newsPost').title('News posts')),
            S.listItem()
              .title('Sweden News (curated)')
              .child(S.documentTypeList('swedenNews').title('Sweden News')),
            S.listItem()
              .title('Players')
              .child(S.documentTypeList('player').title('Players')),
            S.listItem()
              .title('Matches')
              .child(S.documentTypeList('match').title('Matches')),
            S.listItem()
              .title('Standings')
              .child(S.documentTypeList('standing').title('Standings')),
            S.listItem()
              .title('Courts')
              .child(S.documentTypeList('court').title('Courts')),
            S.listItem()
              .title('Sponsors')
              .child(S.documentTypeList('sponsor').title('Sponsors')),
            S.divider(),
            S.listItem()
              .title('Site settings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
                  .title('Site settings'),
              ),
          ]),
    }),
    visionTool(),
  ],
  schema: {types: schemaTypes},
})
