// Shared Sanity client for one-shot maintenance scripts.
//
// Why this file exists:
//   The official `sanity exec ...` CLI needs a sanity.cli.ts file at the
//   repo root *and* env vars loaded a specific way. Easier to bypass it
//   entirely — these scripts run as plain Node and use @sanity/client
//   with config read from the project's .env.local.
//
// Usage from a script:
//   import { getWriteClient } from './_client.mjs'
//   const client = await getWriteClient()
//
// Required env vars in `.env.local` at the project root (~/ifmba/.env.local):
//   NEXT_PUBLIC_SANITY_PROJECT_ID=...
//   NEXT_PUBLIC_SANITY_DATASET=production    # or your dataset name
//   SANITY_API_WRITE_TOKEN=sk_...            # token with write permission
//
// The token is the same one used by the Vercel cron + API routes. To
// generate one if you don't have it locally:
//   1. Go to https://www.sanity.io/manage → project → API → Tokens
//   2. Click "Add API token", grant "Editor" or "Write" permission
//   3. Copy the token and paste into ~/ifmba/.env.local

import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

function loadDotEnv() {
  // Try, in order: the parent of this script's directory (project root,
  // most likely), then the current working directory.
  const here = dirname(fileURLToPath(import.meta.url))
  const candidates = [
    resolve(here, '..', '.env.local'),
    resolve(here, '..', '.env'),
    resolve(process.cwd(), '.env.local'),
    resolve(process.cwd(), '.env'),
  ]

  for (const path of candidates) {
    if (!existsSync(path)) continue
    const text = readFileSync(path, 'utf8')
    for (const raw of text.split('\n')) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq === -1) continue
      const key = line.slice(0, eq).trim()
      let val = line.slice(eq + 1).trim()
      // Strip wrapping quotes
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    }
    return path
  }
  return null
}

export async function getWriteClient() {
  const loadedFrom = loadDotEnv()

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const token = process.env.SANITY_API_WRITE_TOKEN

  if (!projectId) {
    throw new Error(
      'Missing NEXT_PUBLIC_SANITY_PROJECT_ID. ' +
        (loadedFrom
          ? `Loaded env from ${loadedFrom} — but the variable is not set there.`
          : `No .env.local found. Create one at ~/ifmba/.env.local.`),
    )
  }
  if (!token) {
    throw new Error(
      'Missing SANITY_API_WRITE_TOKEN. ' +
        'Generate one at https://www.sanity.io/manage → API → Tokens (Editor or Write), ' +
        'then add SANITY_API_WRITE_TOKEN=sk_... to ~/ifmba/.env.local.',
    )
  }

  console.log(
    `[client] projectId=${projectId}  dataset=${dataset}  env=${loadedFrom || '(process)'}\n`,
  )

  return createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  })
}

/** Read-only client — same as above but doesn't require a token. */
export async function getReadClient() {
  loadDotEnv()
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID.')
  return createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn: false,
  })
}
