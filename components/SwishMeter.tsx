export default function SwishMeter({ fixtures, results, num, numText, className }: { fixtures: any[]; results: any[]; num?: string; numText?: string; className?: string }) {
  const hasData = (fixtures?.length || 0) + (results?.length || 0) > 0

  // Fallback sample rows so the Bloomberg-terminal aesthetic never renders empty.
  // Replaced automatically once real fixtures/results land via Sanity.
  const sampleUpcoming = [
    { _id: 'u1', date: '2026-05-03T18:00:00+02:00', opponent: 'IK Eos Lund HJ', venue: 'Latinskolans sporthall' },
    { _id: 'u2', date: '2026-05-17T17:30:00+02:00', opponent: 'Malbas Vit', venue: 'Baltiska Hallen' },
  ]
  const sampleResults = [
    { _id: 'r1', date: '2026-04-12T18:00:00+02:00', opponent: 'Helamalmö', venue: 'Baltiska Hallen', scoreUs: 74, scoreThem: 58 },
    { _id: 'r2', date: '2026-03-28T17:00:00+02:00', opponent: 'Malmö Ballers', venue: 'Latinskolans sporthall', scoreUs: 69, scoreThem: 61 },
    { _id: 'r3', date: '2026-03-14T19:00:00+02:00', opponent: 'Team4Q', venue: 'Baltiska Hallen', scoreUs: 82, scoreThem: 55 },
  ]

  const upcoming: any[] = hasData ? fixtures : sampleUpcoming
  const played: any[] = hasData ? results : sampleResults

  return (
    <section className={`swish section ${className || ''}`.trim()} data-num={num} data-num-text={numText} id="swish">
      <div className="contain">
        <div className="label r">Bloomberg Terminal</div>
        <h2 className="title r">Swish <em>Meter</em></h2>
        {!hasData && (
          <div className="sw-placeholder-note r">
            Demo-feed · live data via Profixio wireup efter säsongsstart
          </div>
        )}
        <div className="sw-grid" style={{ marginTop: 'clamp(24px,3vw,40px)' }}>
          {/* Upcoming */}
          {upcoming.map((m: any) => (
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
          {played.map((m: any) => {
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
