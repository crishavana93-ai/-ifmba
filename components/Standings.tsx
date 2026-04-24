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

  // Demo fallback so the section always has a shape even before Sanity is populated.
  // Seeded with the real Div 2 Skåne herr lineup — MBA just got promoted.
  const sample: Row[] = [
    { team: 'Malmö Basket Amatörer', position: 1, wins: 0, losses: 0, points: 0, isUs: true },
    { team: 'BC Luleå', position: 2, wins: 0, losses: 0, points: 0 },
    { team: 'Helsingborg Lions', position: 3, wins: 0, losses: 0, points: 0 },
    { team: 'Lund BBK', position: 4, wins: 0, losses: 0, points: 0 },
    { team: 'Trelleborg BBK', position: 5, wins: 0, losses: 0, points: 0 },
    { team: 'Kristianstad Basket', position: 6, wins: 0, losses: 0, points: 0 },
    { team: 'Ystad Basket', position: 7, wins: 0, losses: 0, points: 0 },
    { team: 'Malmö Ballers', position: 8, wins: 0, losses: 0, points: 0 },
  ]

  const rows: Row[] = standings && standings.length > 0 ? standings : sample
  const sorted = [...rows].sort((a, b) => a.position - b.position)

  // Honeycomb layout: adaptive rows based on team count.
  // For 8 teams: rows of 3 / 2 / 3.
  // For 6 teams: rows of 2 / 3 / 1 (MBA centered in middle row).
  // For fewer: single row.
  const us = sorted.find((r) => r.isUs) || sorted[0]
  const rest = sorted.filter((r) => r !== us)
  const total = sorted.length

  let row1: Row[] = []
  let row2: Row[] = []
  let row3: Row[] = []
  if (total >= 8) {
    row1 = rest.slice(0, 3)
    row2 = us && rest.length > 3 ? [rest[3], us] : us ? [us] : []
    row3 = rest.slice(4, 7)
  } else if (total >= 5) {
    row1 = rest.slice(0, Math.min(3, Math.ceil((total - 1) / 2)))
    row2 = us ? [us] : []
    row3 = rest.slice(row1.length)
  } else {
    // 4 or fewer: just pack them all side by side, MBA centered if possible
    row2 = sorted
  }

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
        <div className="label r">Div 2 Skåne Herr · 2025/26 · Uppflyttade</div>
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
          href="https://www.profixio.com/app/leagueid16181"
          target="_blank"
          rel="noopener"
        >
          ⚡ Profixio Live Data
        </a>
      </div>
    </section>
  )
}
