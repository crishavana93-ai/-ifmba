/**
 * SwedenNews — curated headlines from across Swedish basketball.
 *
 * Editorial approach: third-party sites don't expose CORS feeds, so the admin
 * curates headlines in /studio via the `swedenNews` document type. Each item
 * has a source tag (sbbf | liga | skane | fiba) which drives the tabs here.
 *
 * Each card links out to the original article on basketbollen.se, FIBA, etc.
 */
'use client'

import { useMemo, useState } from 'react'

type Item = {
  _id: string
  headline: string
  summary?: string
  source: 'sbbf' | 'liga' | 'skane' | 'fiba' | string
  sourceName?: string
  url: string
  publishedAt?: string
  imageUrl?: string | null
}

type TabKey = 'sbbf' | 'liga' | 'skane' | 'fiba' | 'all'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Alla' },
  { key: 'sbbf', label: 'SBBF' },
  { key: 'liga', label: 'Ligan' },
  { key: 'skane', label: 'Skåne' },
  { key: 'fiba', label: 'FIBA' },
]

function fmtDate(iso?: string) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('sv-SE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function SwedenNews({ items = [] }: { items?: Item[] }) {
  const [tab, setTab] = useState<TabKey>('all')

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length, sbbf: 0, liga: 0, skane: 0, fiba: 0 }
    for (const it of items) if (it.source in c) c[it.source]++
    return c
  }, [items])

  const visible = useMemo(
    () => (tab === 'all' ? items : items.filter((i) => i.source === tab)),
    [items, tab],
  )

  return (
    <section className="swenews section" id="sweden-news">
      <div className="contain">
        <div className="label r">Runt om Sverige</div>
        <h2 className="title r">
          Svensk basket <em>just nu</em>
        </h2>

        <div className="sn-tabs r">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`sn-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
            >
              {t.label}
              <span className="mw-tab-count">{counts[t.key] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="sn-list r">
          {visible.length === 0 && (
            <div className="sn-empty">
              Inga rubriker ännu · Lägg till via /studio
            </div>
          )}
          {visible.map((it) => (
            <a
              key={it._id}
              className="sn-item"
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="sn-date">{fmtDate(it.publishedAt)}</div>
              <div>
                <h3 className="sn-head">{it.headline}</h3>
                {it.summary && <p className="sn-summary">{it.summary}</p>}
              </div>
              <div className="sn-source">{it.sourceName || it.source}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
