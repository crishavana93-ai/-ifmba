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
      // Custom sidebar. Media is broken out into one subfolder per category
      // so the club can drag-drop photos into clearly named buckets instead
      // of setting the category dropdown on every upload.
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // ── Media — split into subfolders by category ─────────────────
            S.listItem()
              .title('Media · Photos & Videos')
              .child(
                S.list()
                  .title('Media · choose a folder')
                  .items([
                    S.listItem()
                      .title('📸 Team photos (Media Wall)')
                      .child(
                        S.documentTypeList('mediaAsset')
                          .title('Team photos')
                          .filter('_type == "mediaAsset" && category == "team"')
                          .initialValueTemplates([
                            S.initialValueTemplateItem('mediaAsset-team'),
                          ]),
                      ),
                    S.listItem()
                      .title('🙌 Fans photos (Media Wall)')
                      .child(
                        S.documentTypeList('mediaAsset')
                          .title('Fans photos')
                          .filter('_type == "mediaAsset" && category == "fans"')
                          .initialValueTemplates([
                            S.initialValueTemplateItem('mediaAsset-fans'),
                          ]),
                      ),
                    S.listItem()
                      .title('🏀 Game Day photos (Media Wall)')
                      .child(
                        S.documentTypeList('mediaAsset')
                          .title('Game Day photos')
                          .filter('_type == "mediaAsset" && category == "gameday"')
                          .initialValueTemplates([
                            S.initialValueTemplateItem('mediaAsset-gameday'),
                          ]),
                      ),
                    S.divider(),
                    S.listItem()
                      .title('🎬 Match-day reel (Tip-off video)')
                      .child(
                        S.documentTypeList('mediaAsset')
                          .title('Match-day reel')
                          .filter(
                            '_type == "mediaAsset" && category == "matchday-reel"',
                          )
                          .initialValueTemplates([
                            S.initialValueTemplateItem('mediaAsset-matchday'),
                          ]),
                      ),
                    S.listItem()
                      .title('🔥 Top Plays (Highlights video clips)')
                      .child(
                        S.documentTypeList('mediaAsset')
                          .title('Top Plays')
                          .filter(
                            '_type == "mediaAsset" && kind == "video" && (category == "gameday" || category == "team")',
                          ),
                      ),
                    S.divider(),
                    S.listItem()
                      .title('👕 Merch / Apparel')
                      .child(
                        S.documentTypeList('mediaAsset')
                          .title('Merch photos')
                          .filter('_type == "mediaAsset" && category == "merch"')
                          .initialValueTemplates([
                            S.initialValueTemplateItem('mediaAsset-merch'),
                          ]),
                      ),
                    S.listItem()
                      .title('🌟 Hero / Family photo')
                      .child(
                        S.documentTypeList('mediaAsset')
                          .title('Hero photos')
                          .filter('_type == "mediaAsset" && category == "hero"')
                          .initialValueTemplates([
                            S.initialValueTemplateItem('mediaAsset-hero'),
                          ]),
                      ),
                    S.listItem()
                      .title('🏟️ Court photos')
                      .child(
                        S.documentTypeList('mediaAsset')
                          .title('Court photos')
                          .filter('_type == "mediaAsset" && category == "court"'),
                      ),
                    S.listItem()
                      .title('🤝 Sponsor assets')
                      .child(
                        S.documentTypeList('mediaAsset')
                          .title('Sponsor assets')
                          .filter(
                            '_type == "mediaAsset" && category == "sponsor"',
                          ),
                      ),
                    S.listItem()
                      .title('📰 News post covers')
                      .child(
                        S.documentTypeList('mediaAsset')
                          .title('News covers')
                          .filter('_type == "mediaAsset" && category == "news"'),
                      ),
                    S.divider(),
                    S.listItem()
                      .title('📂 All media (flat list)')
                      .child(
                        S.documentTypeList('mediaAsset').title(
                          'All Media Assets',
                        ),
                      ),
                  ]),
              ),
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
            S.listItem()
              .title('💼 Sponsor Leads (inbox)')
              .child(
                S.documentTypeList('sponsorLead')
                  .title('Sponsor leads — newest first')
                  .defaultOrdering([{field: 'createdAt', direction: 'desc'}]),
              ),
            S.listItem()
              .title('✉️ Newsletter Subscribers')
              .child(
                S.documentTypeList('subscriber')
                  .title('Newsletter subscribers')
                  .defaultOrdering([{field: 'subscribedAt', direction: 'desc'}]),
              ),
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
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      {
        id: 'mediaAsset-team',
        title: 'Team photo',
        schemaType: 'mediaAsset',
        value: {kind: 'photo', category: 'team', active: true},
      },
      {
        id: 'mediaAsset-fans',
        title: 'Fans photo',
        schemaType: 'mediaAsset',
        value: {kind: 'photo', category: 'fans', active: true},
      },
      {
        id: 'mediaAsset-gameday',
        title: 'Game Day photo',
        schemaType: 'mediaAsset',
        value: {kind: 'photo', category: 'gameday', active: true},
      },
      {
        id: 'mediaAsset-matchday',
        title: 'Match-day reel video',
        schemaType: 'mediaAsset',
        value: {
          kind: 'video',
          category: 'matchday-reel',
          placement: 'tipoff-reel',
          active: true,
        },
      },
      {
        id: 'mediaAsset-merch',
        title: 'Merch photo',
        schemaType: 'mediaAsset',
        value: {kind: 'photo', category: 'merch', active: true},
      },
      {
        id: 'mediaAsset-hero',
        title: 'Hero photo',
        schemaType: 'mediaAsset',
        value: {
          kind: 'photo',
          category: 'hero',
          placement: 'hero-family',
          active: true,
        },
      },
    ],
  },
})
