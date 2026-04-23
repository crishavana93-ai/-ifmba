/**
 * Spotlight — Player of the Month + fan voting.
 *
 * Rules:
 *   - Candidates render with photos (from Sanity `player.photo`).
 *   - Results (bars, percentages) are HIDDEN until 1h after game-end.
 *     `settings.nextMatchDate` + 2.5h (game duration) + 1h buffer = lock release.
 *   - One vote per browser per month (localStorage key includes YYYY-MM).
 *   - Winner selection is frozen once results open.
 *
 * Ballot state lives in localStorage; no server round-trip. Safe for static export.
 */
'use client'

import { useEffect, useMemo, useState } from 'react'

type Player = {
  _id?: string
  number: number
  firstName: string
  lastName: string
  position?: string
  nationality?: string
  flag?: string
  photo?: any
  photoUrl?: string | null
}

type Props = {
  settings: any
  players?: Player[]
}

const MONTHLY_KEY = (yyyymm: string) => `mba_vote_${yyyymm}`
const TALLY_KEY = (yyyymm: string) => `mba_tally_${yyyymm}`

function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function fmtCountdown(ms: number) {
  if (ms <= 0) return 'öppnar nu'
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function Spotlight({ settings, players = [] }: Props) {
  const featured = settings?.spotlightPlayer
  const candidates = (players && players.length > 0 ? players : featured ? [featured] : []).slice(0, 5)

  const month = currentMonth()
  const [myVote, setMyVote] = useState<string | null>(null)
  const [tally, setTally] = useState<Record<string, number>>({})
  const [now, setNow] = useState<number>(() => Date.now())

  // Results unlock: game-end (nextMatchDate + 2.5h) + 1h buffer
  const resultsOpenAt = useMemo(() => {
    const iso = settings?.nextMatchDate
    if (!iso) return 0
    const t = new Date(iso).getTime()
    if (!t) return 0
    return t + (2.5 + 1) * 60 * 60 * 1000
  }, [settings?.nextMatchDate])

  const resultsOpen = resultsOpenAt === 0 ? true : now >= resultsOpenAt

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      setMyVote(localStorage.getItem(MONTHLY_KEY(month)))
      const raw = localStorage.getItem(TALLY_KEY(month))
      setTally(raw ? JSON.parse(raw) : {})
    } catch {}
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [month])

  const vote = (id: string) => {
    if (myVote) return
    setMyVote(id)
    const next = { ...tally, [id]: (tally[id] || 0) + 1 }
    setTally(next)
    try {
      localStorage.setItem(MONTHLY_KEY(month), id)
      localStorage.setItem(TALLY_KEY(month), JSON.stringify(next))
    } catch {}
  }

  const total = Object.values(tally).reduce((a, b) => a + b, 0) || 1

  if (candidates.length === 0) return null

  return (
    <section className="spotlight section" id="spotlight">
      <div className="contain">
        <div className="label r">Månadens spelare</div>
        <h2 className="title r">
          Spot<em>light</em>
        </h2>

        {!resultsOpen && (
          <div
            className="r"
            style={{
              marginTop: 24,
              padding: '12px 18px',
              background: 'var(--cream)',
              borderLeft: '3px solid var(--yellow)',
              fontSize: 13,
              color: 'var(--ink)',
              fontFamily: 'var(--mono)',
              letterSpacing: '0.08em',
            }}
          >
            <strong>Omröstningen pågår</strong> · Resultat visas{' '}
            {fmtCountdown(resultsOpenAt - now)} efter matchens slut
          </div>
        )}

        <div
          className="r"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'clamp(12px, 1.6vw, 20px)',
            marginTop: 'clamp(32px, 4vw, 56px)',
          }}
        >
          {candidates.map((p) => {
            const id = p._id || `${p.number}-${p.lastName}`
            const pct = Math.round((100 * (tally[id] || 0)) / total)
            const picked = myVote === id
            const disabled = !!myVote && !picked
            return (
              <button
                key={id}
                type="button"
                onClick={() => vote(id)}
                disabled={!!myVote}
                style={{
                  position: 'relative',
                  textAlign: 'left',
                  background: picked ? 'var(--cream)' : 'var(--paper)',
                  border: `1px solid ${picked ? 'var(--yellow-deep)' : 'var(--line)'}`,
                  padding: 0,
                  cursor: myVote ? 'default' : 'pointer',
                  opacity: disabled ? 0.55 : 1,
                  transition: 'transform 0.3s var(--ease), border-color 0.3s',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    aspectRatio: '1 / 1',
                    background: '#e8ecf4',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {p.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.photoUrl}
                      alt={`${p.firstName} ${p.lastName}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: 64,
                        color: 'var(--yellow)',
                        background: 'var(--ink)',
                      }}
                    >
                      #{p.number}
                    </div>
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      background: 'var(--yellow)',
                      color: 'var(--ink)',
                      padding: '4px 8px',
                      fontFamily: 'var(--mono)',
                      fontWeight: 800,
                      fontSize: 11,
                    }}
                  >
                    #{p.number}
                  </div>
                </div>
                <div style={{ padding: '14px 16px 16px' }}>
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'var(--sky-deep)',
                    }}
                  >
                    {p.position || 'Spelare'} {p.flag || ''}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 18, marginTop: 4 }}>
                    {p.firstName} {p.lastName}
                  </div>

                  {resultsOpen ? (
                    <div style={{ marginTop: 10 }}>
                      <div
                        style={{
                          height: 6,
                          background: 'var(--surface)',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: `${pct}%`,
                            background: picked ? 'var(--yellow)' : 'var(--sky)',
                            transition: 'width 0.6s var(--ease)',
                          }}
                        />
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontFamily: 'var(--mono)',
                          fontSize: 11,
                          letterSpacing: '0.08em',
                          color: 'var(--muted)',
                        }}
                      >
                        {pct}% · {tally[id] || 0} röster
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: 10,
                        fontFamily: 'var(--mono)',
                        fontSize: 11,
                        letterSpacing: '0.08em',
                        color: 'var(--muted)',
                      }}
                    >
                      {picked ? '✓ Din röst är registrerad' : myVote ? 'Du har redan röstat' : 'Tryck för att rösta'}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {featured && settings?.spotlightQuoteSv && (
          <blockquote
            className="r"
            style={{
              marginTop: 'clamp(32px, 4vw, 56px)',
              fontStyle: 'italic',
              fontSize: 'clamp(18px, 2vw, 24px)',
              color: 'var(--ink-2)',
              borderLeft: '3px solid var(--yellow)',
              paddingLeft: 20,
              maxWidth: 760,
            }}
          >
            "{settings.spotlightQuoteSv}" — #{featured.number} {featured.firstName} {featured.lastName}
          </blockquote>
        )}
      </div>
    </section>
  )
}
