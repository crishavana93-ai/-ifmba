/**
 * Predict — fan score-prediction form + leaderboard.
 *
 * Two panels, side-by-side on desktop, stacked on mobile:
 *   1. Active round: "guess the final score of MBA vs X" — form posts to
 *      /api/prediction.
 *   2. Latest result: the last finalized round's top 10 leaderboard.
 *
 * Gracefully hides the whole section if there is neither an active round
 * NOR a recent final — nothing to show.
 */
'use client'

import React, { useMemo, useState } from 'react'

type ActiveRound = {
  _id: string
  matchup: string
  matchDate: string
  deadline: string
  status: string
} | null

type LeaderboardEntry = {
  _id: string
  displayName: string
  mbaScore: number
  opponentScore: number
  topScorerGuess?: string
  points?: number | null
}

type FinalRound = {
  _id: string
  matchup: string
  matchDate: string
  finalMbaScore?: number
  finalOpponentScore?: number
  topScorerActual?: string
  entries: LeaderboardEntry[]
} | null

type Props = {
  active: ActiveRound
  latestFinal: FinalRound
  num?: string
  numText?: string
  className?: string
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

function fmtSweDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('sv-SE', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })
  } catch { return '' }
}

export default function Predict({ active, latestFinal, num, numText, className }: Props) {
  if (!active && (!latestFinal || latestFinal.entries.length === 0)) return null

  return (
    <section
      className={`predict section ${className || ''}`.trim()}
      data-num={num}
      data-num-text={numText}
      id="predict"
    >
      <div className="contain">
        <div className="label r">Tippa</div>
        <h2 className="title r">
          Tippa <em>matchen</em>
        </h2>
        <p className="predict-intro r">
          Gissa MBA:s nästa resultat. Närmast sant vinner shout-out på vår
          Instagram och en plats på topplistan.
        </p>

        <div className="predict-grid r">
          {active ? <PredictForm round={active} /> : <PredictEmpty />}
          <Leaderboard round={latestFinal} />
        </div>
      </div>
    </section>
  )
}

function PredictForm({ round }: { round: NonNullable<ActiveRound> }) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mba, setMba] = useState('')
  const [opp, setOpp] = useState('')
  const [top, setTop] = useState('')
  const [website, setWebsite] = useState('')
  const mountedAt = useMemo(() => Date.now(), [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setError('')
    try {
      const res = await fetch('/api/prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundId: round._id,
          displayName: name,
          email,
          mbaScore: parseInt(mba, 10),
          opponentScore: parseInt(opp, 10),
          topScorerGuess: top,
          website_url: website,
          elapsedMs: Date.now() - mountedAt,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) throw new Error(data?.error || `HTTP ${res.status}`)
      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      setError(err?.message || 'Kunde inte skicka.')
    }
  }

  if (status === 'success') {
    return (
      <div className="predict-card predict-success">
        <div className="predict-success-icon" aria-hidden>✓</div>
        <h3>Tippning registrerad</h3>
        <p>
          Din gissning på <strong>{round.matchup}</strong> är inskickad. Resultat
          och topplista visas här efter matchen.
        </p>
      </div>
    )
  }

  return (
    <form className="predict-card predict-form" onSubmit={submit} noValidate>
      <div className="predict-match">
        <div className="predict-match-lbl">Nästa match</div>
        <div className="predict-match-name">{round.matchup}</div>
        <div className="predict-match-meta">
          Tip-off: {fmtSweDate(round.matchDate)}{' · '}
          Deadline: {fmtSweDate(round.deadline)}
        </div>
      </div>

      {/* Honeypot */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>Website <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>

      <div className="predict-scores">
        <label className="predict-score">
          <span>MBA</span>
          <input
            type="number" inputMode="numeric" min={0} max={300} required
            value={mba} onChange={(e) => setMba(e.target.value)}
            placeholder="85"
          />
        </label>
        <span className="predict-dash">–</span>
        <label className="predict-score">
          <span>Motståndare</span>
          <input
            type="number" inputMode="numeric" min={0} max={300} required
            value={opp} onChange={(e) => setOpp(e.target.value)}
            placeholder="72"
          />
        </label>
      </div>

      <label className="predict-field">
        <span>Topscorer (MBA) — valfritt</span>
        <input
          type="text"
          value={top}
          onChange={(e) => setTop(e.target.value)}
          placeholder="Förnamn Efternamn"
          maxLength={60}
        />
      </label>

      <label className="predict-field">
        <span>Visningsnamn *</span>
        <input
          type="text" required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ditt namn eller smeknamn"
          maxLength={40}
          autoComplete="name"
        />
      </label>

      <label className="predict-field">
        <span>E-post — valfri (endast om du vinner)</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          inputMode="email"
          maxLength={160}
        />
      </label>

      {status === 'error' && (
        <div className="predict-error" role="alert">{error}</div>
      )}

      <button type="submit" className="btn-cta" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Skickar …' : 'Skicka tippning →'}
      </button>
      <div className="predict-rules">
        Poäng: exakt resultat = 10p · rätt vinnare + summan på 5 = 5p · rätt vinnare = 2p · rätt topscorer = +3p
      </div>
    </form>
  )
}

function PredictEmpty() {
  return (
    <div className="predict-card predict-empty">
      <div className="predict-match-lbl">Ingen öppen tippning just nu</div>
      <p>
        Nästa omgång öppnas inför kommande match. Följ oss på Instagram så
        missar du den inte.
      </p>
    </div>
  )
}

function Leaderboard({ round }: { round: FinalRound }) {
  if (!round || round.entries.length === 0) {
    return (
      <div className="predict-card predict-empty">
        <div className="predict-match-lbl">Topplista</div>
        <p>Första omgångens resultat publiceras efter matchen. Vinnare syns här.</p>
      </div>
    )
  }
  const score =
    round.finalMbaScore != null && round.finalOpponentScore != null
      ? `${round.finalMbaScore} – ${round.finalOpponentScore}`
      : 'Slutresultat saknas'

  return (
    <div className="predict-card predict-leaderboard">
      <div className="predict-match-lbl">Senaste omgången — topplista</div>
      <div className="predict-match-name">{round.matchup}</div>
      <div className="predict-match-meta">Slutresultat: <strong>{score}</strong>{round.topScorerActual ? ` · Topscorer: ${round.topScorerActual}` : ''}</div>
      <ol className="predict-lb">
        {round.entries.map((e, i) => (
          <li key={e._id} className={`predict-lb-row${i === 0 ? ' podium-1' : i === 1 ? ' podium-2' : i === 2 ? ' podium-3' : ''}`}>
            <span className="predict-lb-rank">{i + 1}</span>
            <span className="predict-lb-name">{e.displayName}</span>
            <span className="predict-lb-guess">{e.mbaScore}–{e.opponentScore}</span>
            <span className="predict-lb-pts">{e.points ?? 0} p</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
