export default function SwishMeter({ fixtures, results }: { fixtures: any[]; results: any[] }) {
  return (
    <section className="swish section" id="swish">
      <div className="contain">
        <div className="label r">Bloomberg Terminal</div>
        <h2 className="title r">Swish <em>Meter</em></h2>
        <div className="sw-grid" style={{ marginTop: 'clamp(24px,3vw,40px)' }}>
          {/* Upcoming */}
          {fixtures.map((m: any) => (
            <div key={m._id} className="sw-row up">
              <div className="sw-date">{new Date(m.date).toLocaleDateString('sv-SE', { day:'numeric', month:'short' })}</div>
              <div className="sw-status up">Upcoming</div>
              <div className="sw-match"><strong>MBA</strong> <span className="vs">vs</span> {m.opponent}</div>
              <div className="sw-result time">{new Date(m.date).toLocaleTimeString('sv-SE', { hour:'2-digit', minute:'2-digit' })}</div>
              <div className="sw-venue">{m.venue}</div>
              <div className="sw-bar-wrap"><div className="sw-bar"><em /></div></div>
            </div>
          ))}
          {/* Results */}
          {results.map((m: any) => {
            const win = m.scoreUs > m.scoreThem
            const margin = Math.abs(m.scoreUs - m.scoreThem)
            const fill = Math.min(margin * 3, 100)
            return (
              <div key={m._id} className={`sw-row ${win ? 'w' : 'l'}`}>
                <div className="sw-date">{new Date(m.date).toLocaleDateString('sv-SE', { day:'numeric', month:'short' })}</div>
                <div className={`sw-status ${win ? 'w' : 'l'}`}>{win ? 'WIN' : 'LOSS'}</div>
                <div className="sw-match"><strong>MBA</strong> <span className="vs">vs</span> {m.opponent}</div>
                <div className="sw-result"><span className={win ? 'w' : ''}>{m.scoreUs}</span>–{m.scoreThem}</div>
                <div className="sw-venue">{m.venue}</div>
                <div className="sw-bar-wrap">
                  <div className="sw-bar"><em style={{ '--fill': `${fill}%` } as any} /></div>
                  <span className="sw-margin">+{margin}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
