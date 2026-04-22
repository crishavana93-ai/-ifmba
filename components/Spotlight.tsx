'use client'
export default function Spotlight({ settings }: { settings: any }) {
  const player = settings.spotlightPlayer
  if (!player) return null

  return (
    <section className="spotlight section" id="spotlight">
      <div className="contain">
        <div className="label r">Månadens spelare</div>
        <h2 className="title r">Spot<em>light</em></h2>
        <div className="spot r">
          <div className="spot-visual">
            <div className="spot-num">{player.number}</div>
          </div>
          <div className="spot-info">
            <div className="spot-pos">{player.position} · {player.nationality}</div>
            <h3 className="spot-name">{player.firstName} <em>{player.lastName}</em></h3>
            {settings.spotlightQuoteSv && (
              <blockquote className="spot-quote">"{settings.spotlightQuoteSv}"</blockquote>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
