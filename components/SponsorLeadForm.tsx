/**
 * SponsorLeadForm — bottom-of-page lead capture for /partners.
 *
 * Client component. Submits to /api/sponsor-lead (which writes to Sanity,
 * optionally emails Cris via Resend). Shows inline success / error states.
 *
 * Honeypot: the hidden `website_url` input is there for bots. Real humans
 * never fill it, so any submission with that field populated is silently
 * accepted and dropped server-side.
 */
'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function SponsorLeadForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  // Form state (controlled to allow us to clear on success).
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [tier, setTier] = useState('Any')
  const [budget, setBudget] = useState('tbd')
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)

  // Honeypot — invisible field; bots fill it, humans don't.
  const [website, setWebsite] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'submitting') return

    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/sponsor-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          company,
          email,
          phone,
          tier,
          budget,
          message,
          consent,
          website_url: website,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`)
      }
      setStatus('success')
      setName(''); setCompany(''); setEmail(''); setPhone('')
      setTier('Any'); setBudget('tbd'); setMessage(''); setConsent(false)
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err?.message || 'Något gick fel.')
    }
  }

  if (status === 'success') {
    return (
      <div className="lead-success r">
        <div className="lead-success-icon" aria-hidden="true">✓</div>
        <h3>Tack — vi hör av oss.</h3>
        <p>
          Vi läser varje inkommande förfrågan inom 48 timmar. Under tiden — håll
          utkik i inkorgen, och följ oss gärna på sociala medier.
        </p>
        <button
          type="button"
          className="btn-cta btn-cta-ghost"
          onClick={() => setStatus('idle')}
        >
          Skicka en till
        </button>
      </div>
    )
  }

  return (
    <form className="lead-form r" onSubmit={submit} noValidate>
      {/* Honeypot — visually hidden but present in the DOM. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>Website (lämna tomt)
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      <div className="lead-form-grid">
        <label className="lead-field">
          <span>Namn <em>*</em></span>
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
          />
        </label>
        <label className="lead-field">
          <span>Företag <em>*</em></span>
          <input
            type="text"
            required
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            maxLength={160}
          />
        </label>
        <label className="lead-field">
          <span>E-post <em>*</em></span>
          <input
            type="email"
            required
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={160}
          />
        </label>
        <label className="lead-field">
          <span>Telefon</span>
          <input
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={40}
            placeholder="+46 …"
          />
        </label>
        <label className="lead-field">
          <span>Paket</span>
          <select value={tier} onChange={(e) => setTier(e.target.value)}>
            <option value="Any">Ingen preferens — visa alla</option>
            <option value="Platinum">Platinum — 75 000 kr / 2 år</option>
            <option value="Gold">Guld — 50 000 kr / 2 år</option>
            <option value="Silver">Silver — 25 000 kr / 2 år</option>
            <option value="Bronze">Brons — 10 000 kr / 2 år</option>
          </select>
        </label>
        <label className="lead-field">
          <span>Budget</span>
          <select value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="tbd">Ej bestämt</option>
            <option value="lt25">Under 25 000 kr</option>
            <option value="25to50">25 000 – 50 000 kr</option>
            <option value="50to100">50 000 – 100 000 kr</option>
            <option value="gt100">100 000 kr +</option>
          </select>
        </label>
      </div>

      <label className="lead-field lead-field-full">
        <span>Meddelande</span>
        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          placeholder="Berätta vad ni vill uppnå — exponering, CSR, event, rekrytering?"
        />
      </label>

      <label className="lead-consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
        />
        <span>
          Jag samtycker till att MBA behandlar mina uppgifter för att kunna
          svara på denna förfrågan. Vi delar dem aldrig med tredje part.
        </span>
      </label>

      {status === 'error' && (
        <div className="lead-error" role="alert">
          {errorMsg || 'Något gick fel. Försök igen eller maila oss direkt.'}
        </div>
      )}

      <div className="lead-actions">
        <button
          type="submit"
          className="btn-cta"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Skickar …' : 'Skicka förfrågan →'}
        </button>
        <span className="lead-meta">
          Vi återkopplar inom 48 timmar på vardagar.
        </span>
      </div>
    </form>
  )
}
