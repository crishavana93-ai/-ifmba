# Media · Photos & Videos (Sanity Studio)

One unified "Media" document type for **every photo and every video** on the site.
Upload once in the Studio → the site pulls it automatically by category or placement.

## How to deploy schema changes

The Studio is embedded in the Next.js app at `/studio`. To ship schema edits:

```
bash ~/Documents/MBA/ifmba-scaffold/sync-and-deploy.sh
```

That syncs `sanity/schemaTypes/*.ts` + `sanity.config.ts` into `~/ifmba`,
runs `npm install && next build`, and `git push`. Vercel auto-deploys the
updated Studio within ~2 minutes. **No separate `sanity deploy` is needed** —
Studio and site are one deployment.

## Where you'll see it in the Studio

After the deploy finishes, go to **https://ifmba.se/studio**, sign in, and
the left sidebar shows:

> **Media · Photos & Videos** (at the top)

Click **+ New** to add an asset.

## How to upload

1. Pick **Type** — Photo or Video.
2. Pick **Category** — this decides where on the site the asset shows up:
   - `Team (Media Wall)` → Media Wall's Team tab
   - `Fans (Media Wall)` → Media Wall's Fans tab
   - `Game Day (Media Wall)` → Media Wall's Game Day tab
   - `Match-Day Reel` → the tip-off video card on the home page
   - `Hero / Family photo` → the hero section background
   - `News post cover` → reusable across news posts
   - `Player portrait` → voting cards + squad grid
   - `Merch / Apparel` → apparel cards
   - `Court photo` → courts section
   - `Sponsor asset` → sponsor logos
3. Drop the file into **Photo file** (for images) or **Video file** (for `.mp4`/`.webm`/`.mov`).
4. For videos, optionally upload a **poster** (thumbnail shown before the video plays).
5. Add a Swedish and/or English caption — these render as overlays where captions are shown.
6. (Optional) **Specific placement slot** — pins this asset to a single slot on the site,
   so it replaces the default. Use this for things like "the official match-day reel video"
   or "the current hero family photo".
7. Click **Publish**. The site updates on the next build (or instantly if ISR revalidates).

## Replacing the match-day video

1. Open **Media · Photos & Videos** → **+ New**.
2. Type = **Video**.
3. Category = **Match-Day Reel (Tip-off video)**.
4. Specific placement slot = **Tip-off · Match-day reel video**.
5. Upload the new .mp4.
6. Publish. The old one is automatically superseded (it was also pinned to the same slot).

## Replacing the hero family photo

Same flow — Category = `Hero / Family photo`, Placement = `Hero · Family photo`, drop image, publish.

## Tips

- **Hotspot**: When uploading photos, click the hotspot icon to set the focal point. The site
  crops around that point so faces don't get cut off on mobile.
- **Order**: Leave blank for newest-first order. Set a number to force priority (higher = first).
- **Hidden**: Uncheck "Visible on site" to hide without deleting.
- **File size**: Videos should be ≤ 50 MB for fast loading. Compress before uploading — try
  [HandBrake](https://handbrake.fr/) with the "Web Optimized" preset, H.264, 1080p, 3–5 Mbps.

## GROQ queries (for developers)

The front-end queries media via three helpers in `src/lib/sanity.ts`:

```ts
QUERIES.mediaAll                         // every visible asset
QUERIES.mediaByCategory('team')          // one Media Wall tab
QUERIES.mediaByPlacement('tipoff-reel')  // the single pinned match-day video
```

Each row returns `{ kind, category, placement, imageUrl, videoUrl, posterUrl, captionSv, captionEn, ... }`
so the front-end can render `<img src={imageUrl}>` or `<video src={videoUrl} poster={posterUrl}>` directly.
