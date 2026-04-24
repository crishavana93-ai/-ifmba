/**
 * Spotlight — fan voting for Match Player + Season Player.
 *
 * Two side-by-side ballots:
 *   • Månadens spelare (Match / Month player) — resets monthly.
 *   • Säsongens spelare (Season player)        — resets at season start (Sep).
 *
 * UX rules:
 *   - Results are LIVE (percent bars visible immediately). Cris explicitly
 *     wanted the counts readable the moment a vote is cast.
 *   - One vote per ballot per browser. Users can revoke or change their
 *     vote with an "Ångra röst" (undo vote) button — tally is decremented
 *     when they revoke, re-incremented when they pick a new candidate.
 *   - Ballot state lives in localStorage; no server round-trip. When we
 *     move to Supabase later, this component swaps its storage layer with
 *     minimal changes (keep the `useBallot` hook shape, replace the body).
 */
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

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
  settings?: any
  players?: Player[]
  num?: string
  numText?: string
  className?: string
}

type BallotId = 'match' | 'season'

// Scope keys — match ballot resets each month, season ballot each season start.
function currentMonthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function currentSeasonKey() {
  // Swedish basketball season: Sep → May. A season started in 2025 runs
  // through spring 2026. If today is before September, we're in the season
  // that *started* the previous calendar year.
  const d = new Date()
  const startYear = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1
  return `${startYear}/${String((startYear + 1) % 100).padStart(2, '0')}`
}

const VOTE_KEY = (ballot: BallotId, scope: string) => `mba_vote_${ballot}_${scope}`
const TALLY_KEY = (ballot: BallotId, scope: string) => `mba_tally_${ballot}_${scope}`

/** Ballot state isolated per (ballot × scope). Revoke decrements the tally. */
function useBallot(ballot: BallotId, scope: string) {
  const [myVote, setMyVote] = useState<string | null>(null)
  const [tally, setTally] = useState<Record<string, number>>({})

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      setMyVote(localStorage.getItem(VOTE_KEY(ballot, scope)))
      const raw = localStorage.getItem(TALLY_KEY(ballot, scope))
      setTally(raw ? JSON.parse(raw) : {})
    } catch {}
  }, [ballot, scope])

  const persistTally = (next: Record<string, number>) => {
    setTally(next)
    try {
      localStorage.setItem(TALLY_KEY(ballot, scope), JSON.stringify(next))
    } catch {}
  }

  const cast = useCallback(
    (id: string) => {
      // Already chose this one? No-op.
      if (myVote === id) return
      const next = { ...tally }
      // If switching vote, decrement the old one before incrementing the new.
      if (myVote && next[myVote] && next[myVote] > 0) next[myVote] = next[myVote] - 1
      next[id] = (next[id] || 0) + 1
      persistTally(next)
      setMyVote(id)
      try {
        localStorage.setItem(VOTE_KEY(ballot, scope), id)
      } catch {}
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ballot, scope, myVote, tally],
  )

  const revoke = useCallback(() => {
    if (!myVote) return
    const next = { ...tally }
    if (next[myVote] && next[myVote] > 0) next[myVote] = next[myVote] - 1
    persistTally(next)
    setMyVote(null)
    try {
      localStorage.removeItem(VOTE_KEY(ballot, scope))
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ballot, scope, myVote, tally])

  const total = useMemo(
    () => Object.values(tally).reduce((a, b) => a + b, 0),
    [tally],
  )

  return { myVote, tally, total, cast, revoke }
}

function Ballot({
  title,
  subtitle,
  candidates,
  ballot,
  scope,
}: {
  title: string
  subtitle: string
  candidates: Player[]
  ballot: BallotId
  scope: string
}) {
  const { myVote, tally, total, cast, revoke } = useBallot(ballot, scope)

  return (
    <div className="ballot">
      <header className="ballot-head">
        <div>
          <div className="ballot-title">{title}</div>
          <div className="ballot-sub">{subtitle}</div>
        </div>
        <div className="ballot-meta">
          <span className="ballot-total">
            {total > 0 ? `${total} ${total === 1 ? 'röst' : 'röster'}` : 'Bli först'}
          </span>
          {myVote && (
            <button type="button" className="ballot-revoke" onClick={revoke}>
              Ångra röst
            </button>
          )}
        </div>
      </header>

      <ul className="ballot-list">
        {candidates.map((p) => {
          const id = p._id || `${p.number}-${p.lastName}`
          const votes = tally[id] || 0
          const pct = total > 0 ? Math.round((100 * votes) / total) : 0
          const picked = myVote === id
          return (
            <li key={id}>
              <button
                type="button"
                className={`ballot-card${picked ? ' picked' : ''}`}
                onClick={() => cast(id)}
                aria-pressed={picked}
              >
                <div className="ballot-card-img">
                  {p.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photoUrl} alt={`${p.firstName} ${p.lastName}`} />
                  ) : (
                    <div className="ballot-card-img-fallback">#{p.number}</div>
                  )}
                  <span className="ballot-card-num">#{p.number}</span>
                </div>
                <div className="ballot-card-body">
                  <div className="ballot-card-pos">
                    {p.position || '—'} {p.flag || ''}
                  </div>
                  <div className="ballot-card-name">
                    {p.firstName} {p.lastName}
                  </div>
                  <div className="ballot-bar-wrap" aria-hidden="true">
                    <div className="ballot-bar" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="ballot-stats">
                    <span className="ballot-pct">{pct}%</span>
                    <span className="ballot-dot">·</span>
                    <span>
                      {votes} {votes === 1 ? 'röst' : 'röster'}
                    </span>
                    {picked && <span className="ballot-you">Din röst</span>}
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function Spotlight({ players = [], num, numText, className }: Props) {
  const candidates = (players || []).slice(0, 6)
  const monthKey = currentMonthKey()
  const seasonKey = currentSeasonKey()

  if (candidates.length === 0) return null

  return (
    <section
      className={`spotlight section ${className || ''}`.trim()}
      data-num={num}
      data-num-text={numText}
      id="spotlight"
    >
      <div className="contain">
        <div className="label r">Fans röstar</div>
        <h2 className="title r">
          Spot<em>light</em>
        </h2>
        <p className="spotlight-intro r">
          Rösta på <em>månadens</em> och <em>säsongens</em> spelare. En röst per
          kategori &mdash; du kan ändra eller ångra din röst när som helst.
          Resultaten uppdateras direkt.
        </p>

        <div className="spotlight-ballots r">
          <Ballot
            ballot="match"
            scope={monthKey}
            title="Månadens spelare"
            subtitle={`Omröstning · ${monthKey}`}
            candidates={candidates}
          />
          <Ballot
            ballot="season"
            scope={seasonKey}
            title="Säsongens spelare"
            subtitle={`Säsong · ${seasonKey}`}
            candidates={candidates}
          />
        </div>
      </div>
    </section>
  )
}
