import player from './player'
import match from './match'
import standing from './standing'
import court from './court'
import sponsor from './sponsor'
import sponsorLead from './sponsorLead'
import subscriber from './subscriber'
import predictionRound from './predictionRound'
import prediction from './prediction'
import newsPost from './newsPost'
import siteSettings from './siteSettings'
import mediaAsset from './mediaAsset'
import swedenNews from './swedenNews'
import dropshipProduct from './dropshipProduct'
import reservation from './reservation'

export const schemaTypes = [mediaAsset, swedenNews, player, match, standing, court, sponsor, sponsorLead, subscriber, predictionRound, prediction, newsPost, siteSettings, dropshipProduct, reservation]

// Sanity v3 `defineConfig` expects a `schema` object: `{ types: [...] }`.
// Export both shapes so any `sanity.config.ts` style (schema or schemaTypes) resolves.
export const schema = { types: schemaTypes }
