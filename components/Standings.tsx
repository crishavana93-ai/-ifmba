'use client'
export default function Standings({ standings }: { standings: any[] }) {
  return (
    <section className="standings section" id="standings">
      <div className="contain">
        <div className="label r">Div 3 Skåne · 2025/26</div>
        <h2 className="title r">The Skåne <em>Grid</em></h2>
        <div className="table-wrap open" style={{ maxHeight: 'none', marginTop: 'clamp(24px,3vw,40px)' }}>
          <table className="league">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Lag</th>
                <th>V</th><th>F</th><th>P</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s: any) => (
                <tr key={s._id} className={s.isUs ? 'us' : ''}>
                  <td><span className={`pos${s.position === 1 ? ' first' : ''}`}>{s.position}</span> {s.team}</td>
                  <td>{s.wins}</td>
                  <td>{s.losses}</td>
                  <td className="pts">{s.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <a className="profixio-credit" href="https://www.profixio.com/app/leagueid16182/category/1150620" target="_blank" rel="noopener">
          ⚡ Profixio Live Data
        </a>
      </div>
    </section>
  )
}
