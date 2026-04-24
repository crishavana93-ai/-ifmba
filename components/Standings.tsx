'use client'
import { useState } from 'react'

type Row = {
  _id?: string
  team: string
  position: number
  wins: number
  losses: number
  points: number
  isUs?: boolean
  /** Optional: `div3` (current) or `div2` (next season). Falls back to div3. */
  series?: 'div3' | 'div2'
}

export default function Standings({
  standings,
  num,
  numText,
  className,
}: {
  standings: Row[]
  num?: string
  numText?: string
  className?: string
}) {
  const [tab, setTab] = useState<'div3' | 'div2'>('div3')

  // ── Div 3 Skåne Herr · 2025/26 — current season ─────────────────────
  const div3Sample: Row[] = [
    { team: 'Malmö Basket Amatörer', position: 1, wins: 5, losses: 0, points: 10, isUs: true },
    { team: 'Team4Q Div3', position: 2, wins: 4, losses: 1, points: 8 },
    { team: 'Malmö Ballers', position: 3, wins: 4, losses: 2, points: 8 },
    { team: 'Malbas Motion', position: 4, wins: 4, losses: 3, points: 8 },
    { team: 'Halmstad BC', position: 5, wins: 3, losses: 2, points: 6 },
    { team: 'Helamalmö Basket', position: 6, wins: 2, losses: 4, points: 4 },
    { team: 'Malbas Vit', position: 7, wins: 0, losses: 5, points: 0 },
    { team: 'IK Eos Lund HJ', position: 8, wins: 0, losses: 5, points: 0 },
  ]

  const fromSanity = standings || []
  const div3Live = fromSanity.filter((s) => (s.series || 'div3') === 'div3')
  const div2Live = fromSanity.filter((s) => s.series === 'div2')

  const div3 = div3Live.length > 0 ? div3Live : div3Sample
  const div3Sorted = [...div3].sort((a, b) => a.position - b.position)
  const div2Sorted = [...div2Live].sort((a, b) => a.position - b.position)

  const profixioDiv3 = 'https://www.profixio.com/app/lx/competition/leagueid17491/teams/1413022?k=1161117'
  // TODO: swap to the Div 2 Skåne Herr 2026/27 league URL once MBA is
  // officially promoted (find it on Profixio after the draw). Defaulting to
  // the current Div 3 Skåne page so the button doesn't point at a Stockholm league.
  const profixioDiv2 = 'https://www.profixio.com/app/lx/competition/leagueid17491/teams/1413022?k=1161117'

  return (
    <section
      className={`standings section ${className || ''}`.trim()}
      data-num={num}
      data-num-text={numText}
      id="standings"
    >
      <div className="contain">
        <div className="label r">Seriekalender · 2025/26 → 2026/27</div>
        <h2 className="title r" dangerouslySetInnerHTML={{ __html: 'The Skåne <em>Grid</em>' }} />

        {/* Tabs: Div 3 (current) · Div 2 (next — coming soon) */}
        <div className="st-tabs r">
          <button
            type="button"
            className={`st-tab${tab === 'div3' ? ' active' : ''}`}
            onClick={() => setTab('div3')}
          >
            Div 3 Skåne Herr · 2025/26
            <span className="st-tab-meta">Pågående säsong</span>
          </button>
          <button
            type="button"
            className={`st-tab${tab === 'div2' ? ' active' : ''}`}
            onClick={() => setTab('div2')}
          >
            Div 2 Skåne Herr · 2026/27
            <span className="st-tab-meta">Uppflyttade · snart</span>
          </button>
        </div>

        {tab === 'div3' && (
          <>
            <div className="table-wrap open r" style={{ width: '100%', marginTop: '16px' }}>
              <table className="league">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Lag</th>
                    <th>GP</th>
                    <th>V</th>
                    <th>F</th>
                    <th>P</th>
                  </tr>
                </thead>
                <tbody>
                  {div3Sorted.map((s) => (
                    <tr key={s._id || s.team} className={s.isUs ? 'us' : ''}>
                      <td>
                        <span className={`pos${s.position === 1 ? ' first' : ''}`}>{s.position}</span>{' '}
                        {s.team}
                      </td>
                      <td>{s.wins + s.losses}</td>
                      <td>{s.wins}</td>
                      <td>{s.losses}</td>
                      <td className="pts">{s.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <a
              className="profixio-credit r"
              href={profixioDiv3}
              target="_blank"
              rel="noopener"
            >
              ⚡ Profixio · Div 3 live-data
            </a>
          </>
        )}

        {tab === 'div2' && (
          <div className="st-coming r">
            <div className="st-coming-inner">
              <div className="st-coming-label">Säsong 2026/27</div>
              <h3 className="st-coming-head">
                Snart: MBA i <em>Div 2 Skåne Herr</em>
              </h3>
              <p className="st-coming-body">
                Vi avslutar 2025/26 som uppflyttade från Div 3. Tabellen för Div 2 publiceras
                här så snart serien är spikad — preliminärt i augusti 2026. Under tiden kan
                ni följa oss i Div 3 och läsa om promoveringen på Profixio.
              </p>
              <div className="st-coming-cta">
                <a
                  className="btn-cta"
                  href={profixioDiv2}
                  target="_blank"
                  rel="noopener"
                >
                  Profixio · Div 2 Herr →
                </a>
                <button
                  type="button"
                  className="btn-cta btn-cta-ghost"
                  onClick={() => setTab('div3')}
                >
                  ← Se Div 3 tabell
                </button>
              </div>
              {div2Sorted.length > 0 && (
                <div
                  className="table-wrap open"
                  style={{ width: '100%', marginTop: '24px' }}
                >
                  <table className="league">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Lag</th>
                        <th>GP</th>
                        <th>V</th>
                        <th>F</th>
                        <th>P</th>
                      </tr>
                    </thead>
                    <tbody>
                      {div2Sorted.map((s) => (
                        <tr key={s._id || s.team} className={s.isUs ? 'us' : ''}>
                          <td>
                            <span className={`pos${s.position === 1 ? ' first' : ''}`}>{s.position}</span>{' '}
                            {s.team}
                          </td>
                          <td>{s.wins + s.losses}</td>
                          <td>{s.wins}</td>
                          <td>{s.losses}</td>
                          <td className="pts">{s.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
