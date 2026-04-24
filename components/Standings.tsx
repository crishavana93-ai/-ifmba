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
}

function abbr(team: string) {
  // short label for the hex face: prefer the dominant word, strip filler
  const s = team
    .replace(/Basket(ball)?|Div\s*3|HJ|BBK|BK|IK|IF/gi, '')
    .trim()
  const firstWord = s.split(/\s+/)[0] || team.split(/\s+/)[0]
  return firstWord.length > 9 ? firstWord.slice(0, 8) : firstWord
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
  const [showTable, setShowTable] = useState(false)

  // Demo fallback so the section always has a shape even before Sanity is populated
  const sample: Row[] = [
    { team: 'Malmö Basket Amatörer', position: 1, wins: 5, losses: 0, points: 10, isUs: true },
    { team: 'Team4Q Div3', position: 2, wins: 4, losses: 1, points: 8 },
    { team: 'Malmö Ballers', position: 3, wins: 4, losses: 2, points: 8 },
    { team: 'Malbas Motion', position: 4, wins: 4, losses: 3, points: 8 },
    { team: 'Halmstad BC', position: 5, wins: 3, losses: 2, points: 6 },
    { team: 'Helamalmö Basket', position: 6, wins: 2, losses: 4, points: 4 },
    { team: 'Malbas Vit', position: 7, wins: 0, losses: 5, points: 0 },
    { team: 'IK Eos Lund HJ', position: 8, wins: 0, losses: 5, points: 0 },
  ]

  const rows: Row[] = standings && standings.length > 0 ? standings : sample
  const sorted = [...rows].sort((a, b) => a.position - b.position)

  // Honeycomb layout: rows of 3 / 2 / 3 / 2 / ...
  // We place MBA (us) in the 2nd row, centered.
  const us = sorted.find((r) => r.isUs) || sorted[0]
  const rest = sorted.filter((r) => r !== us)
  const row1 = rest.slice(0, 3)
  const row2Others = rest.slice(3, 4) // one other alongside MBA
  const row2 = us && row2Others.length ? [row2Others[0], us] : us ? [us] : []
  const row3 = rest.slice(4, 7)

  function heat(r: Row) {
    const gp = r.wins + r.losses
    return gp === 0 ? 0 : Math.round((r.wins / gp) * 100)
  }

  function Hex({ r }: { r: Row }) {
    const isUs = r.isUs
    return (
      <div
        className={`hex${isUs ? ' mba' : ''}`}
        style={{ ['--heat' as any]: isUs ? 100 : heat(r) } as React.CSSProperties}
        data-rank={r.position}
        data-w={r.wins}
        data-l={r.losses}
        data-p={r.points}
      >
        <div className="hex-rank">#{r.position}</div>
        <div className="hex-abbr">{isUs ? 'MBA' : abbr(r.team)}</div>
        <div className="hex-pts">{r.points} pts</div>
        <div className="hex-tip">
          <div className="tt-name">{r.team}</div>
          <div className="tt-row"><span>W–L</span><b>{r.wins}–{r.losses}</b></div>
          <div className="tt-row"><span>Win %</span><b>{heat(r)}%</b></div>
          <div className="tt-row"><span>Pts</span><b>{r.points}</b></div>
        </div>
      </div>
    )
  }

  return (
    <section
      className={`standings section ${className || ''}`.trim()}
      data-num={num}
      data-num-text={numText}
      id="standings"
    >
      <div className="contain">
        <div className="label r">Div 3 Skåne · 2025/26</div>
        <h2 className="title r" dangerouslySetInnerHTML={{ __html: 'The Skåne <em>Grid</em>' }} />

        <div className="honey r" style={{ marginTop: 'clamp(28px,3.5vw,48px)' }}>
          {row1.length > 0 && (
            <div className="honey-row">
              {row1.map((r) => <Hex key={r._id || r.team} r={r} />)}
            </div>
          )}
          {row2.length > 0 && (
            <div className="honey-row r2">
              {row2.map((r) => <Hex key={r._id || r.team} r={r} />)}
            </div>
          )}
          {row3.length > 0 && (
            <div className="honey-row">
              {row3.map((r) => <Hex key={r._id || r.team} r={r} />)}
            </div>
          )}
        </div>

        <div className="grid-legend r" style={{ marginTop: 'clamp(20px,2.5vw,32px)' }}>
          <span>Kall</span>
          <span className="legend-bar" />
          <span>Het</span>
        </div>
        <div className="grid-caption r">
          Färgintensitet = vinstprocent · Hovra över en hexagon för detaljer
        </div>

        <button
          type="button"
          className={`grid-toggle r${showTable ? ' open' : ''}`}
          aria-expanded={showTable}
          onClick={() => setShowTable((v) => !v)}
          style={{ marginTop: '18px' }}
        >
          <span>{showTable ? 'Dölj full tabell' : 'Visa full tabell'}</span>
        </button>

        <div
          className={`table-wrap${showTable ? ' open' : ''}`}
          style={{ width: '100%', marginTop: '8px' }}
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
              {sorted.map((s) => (
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
          className="profixio-credit"
          href="https://www.profixio.com/app/leagueid16182/category/1150620"
          target="_blank"
          rel="noopener"
        >
          ⚡ Profixio Live Data
        </a>
      </div>
    </section>
  )
}
