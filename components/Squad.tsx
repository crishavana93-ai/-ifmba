export default function Squad({
  players,
  num,
  numText,
  className,
}: {
  players: any[]
  num?: string
  numText?: string
  className?: string
}) {
  return (
    <section
      className={`squad section ${className || ''}`.trim()}
      data-num={num}
      data-num-text={numText}
      id="squad"
    >
      <div className="contain">
        <div className="label r">Säsong 2025/26 · 8 nationer</div>
        <h2
          className="title r"
          dangerouslySetInnerHTML={{ __html: '8 Nationer, <em>ett lag</em>' }}
        />
        <div className="ribbon-wrap" style={{ marginTop: 'clamp(24px,3vw,40px)' }}>
          <div
            className="ribbon-track"
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              padding: '4px 2px 24px',
            }}
          >
            {players.map((p: any) => {
              const hasPhoto = !!p.photoUrl
              return (
                <div
                  key={p._id}
                  className={`card${hasPhoto ? ' has-photo' : ''}`}
                  style={{ flex: '0 0 clamp(180px,22vw,220px)', aspectRatio: '3/4' }}
                >
                  <div className="card-inner">
                    <div
                      className="card-front"
                      style={
                        hasPhoto
                          ? {
                              backgroundImage: `linear-gradient(180deg, rgba(11,18,32,0) 0%, rgba(11,18,32,0.15) 45%, rgba(11,18,32,0.85) 100%), url(${p.photoUrl})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center top',
                            }
                          : undefined
                      }
                    >
                      <span className="card-flag">{p.flag || '🏀'}</span>
                      <div className="card-num">{p.number}</div>
                      <div>
                        <div className="card-name-last">{p.lastName}</div>
                        <div className="card-name-init">
                          {p.firstName?.[0]}. {p.lastName}
                        </div>
                      </div>
                    </div>
                    <div className="card-back">
                      <div className="card-back-head">
                        <div className="card-back-name">
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="card-back-num">{p.number}</div>
                      </div>
                      <div className="card-back-nation">
                        <span>{p.flag}</span> {p.nationality}
                      </div>
                      <div className="card-back-pos">{p.position || 'Player'}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
