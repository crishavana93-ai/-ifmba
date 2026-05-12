'use client'
/**
 * Swish — donation block.
 *
 * Swish is the dominant person-to-person and donation rail in Sweden — 8M+
 * users, ~70% of the population. We surface the club's Swish number plus a
 * scannable QR that auto-fills the recipient + a pre-filled message so
 * donations are easy to reconcile.
 *
 * Config lives in Sanity `siteSettings`:
 *   swishNumber, swishPayee, swishMessage,
 *   swishGoalSek, swishRaisedSek,
 *   swishGoalLabelSv / swishGoalLabelEn
 *
 * If `swishNumber` is empty, the whole component renders null so the page
 * doesn't show a half-broken donation block on a fresh install.
 *
 * QR encoding: we use the Swish "swish://payment?…" URI which most modern
 * Swedish banking apps recognise. For maximum compatibility we also link
 * the number as plain text. The QR image itself is generated server-side
 * via the public api.qrserver.com endpoint to avoid adding a dependency.
 */

import { useLang } from '@/lib/i18n'

type Settings = {
  swishNumber?: string
  swishPayee?: string
  swishMessage?: string
  swishGoalSek?: number
  swishRaisedSek?: number
  swishGoalLabelSv?: string
  swishGoalLabelEn?: string
}

function fmtSek(n: number) {
  return new Intl.NumberFormat('sv-SE').format(n) + ' kr'
}

/** Render "0723173140" as "072-317 31 40" — Swedish phone-style. Falls back
 *  to the raw input if it's not a 10-digit personal Swish number. */
function fmtSwishNumber(raw: string) {
  const d = raw.replace(/\D/g, '')
  if (d.length === 10 && d.startsWith('0')) {
    return `${d.slice(0, 3)}-${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`
  }
  if (d.length === 10) {
    // Business / 123-Swish format (typical: 1234567890 → 123 456 78 90)
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`
  }
  return raw
}

export default function Swish({
  settings,
  num,
  numText,
  className,
}: {
  settings: Settings | null | undefined
  num?: string
  numText?: string
  className?: string
}) {
  const { lang } = useLang()

  const number = (settings?.swishNumber || '').replace(/\s+/g, '')
  if (!number) return null // hide entirely until Cris pastes the real number

  const payee = settings?.swishPayee || 'IFK Malmö Basket'
  const message = settings?.swishMessage || 'MBA'
  const goal = Math.max(1, settings?.swishGoalSek ?? 50000)
  const raised = Math.max(0, settings?.swishRaisedSek ?? 0)
  const pct = Math.min(100, Math.round((raised / goal) * 100))

  const goalLabel = lang === 'en'
    ? (settings?.swishGoalLabelEn || 'Help us reach Div 1')
    : (settings?.swishGoalLabelSv || 'Hjälp oss till Div 1')

  // Swish payment URI — opens the Swish app on iOS/Android with prefilled fields.
  // Format: swish://payment?data=...
  const payload = `C${number};${message};0`
  const swishUri = `swish://payment?data=${encodeURIComponent(payload)}`
  // Public QR image — encodes the swish:// URI. ~270×270 PNG.
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=270x270&margin=2&data=${encodeURIComponent(swishUri)}`

  const copy = lang === 'en'
    ? {
        eyebrow: 'Support the club',
        title: 'Donate via Swish',
        titleEm: 'in 10 seconds',
        body: `100% goes straight to the club. Scan the QR with your Swish app or send to the number below. We update the season tracker after every reconciliation.`,
        scan: 'Scan with Swish',
        number: 'Swish number',
        copy: 'Copy number',
        copied: 'Copied',
        open: 'Open Swish',
        raised: 'Raised',
        of: 'of',
        thanks: 'Tack — every krona builds the family.',
      }
    : {
        eyebrow: 'Stöd klubben',
        title: 'Donera via Swish',
        titleEm: 'på 10 sekunder',
        body: `100% går direkt till klubben. Skanna QR-koden med din Swish-app eller skicka till numret nedan. Vi uppdaterar säsongsmätaren efter varje avstämning.`,
        scan: 'Skanna med Swish',
        number: 'Swish-nummer',
        copy: 'Kopiera numret',
        copied: 'Kopierat',
        open: 'Öppna Swish',
        raised: 'Insamlat',
        of: 'av',
        thanks: 'Tack — varje krona bygger familjen.',
      }

  return (
    <section
      className={`swishd section ${className || ''}`.trim()}
      data-num={num}
      data-num-text={numText}
      id="donera"
    >
      <div className="contain">
        <div className="label r">{copy.eyebrow}</div>
        <h2 className="title r">
          {copy.title} <em>{copy.titleEm}</em>
        </h2>

        <div className="swishd-grid r">
          {/* Left — QR card */}
          <div className="swishd-qr">
            <div className="swishd-qr-frame">
              <img
                src={qrSrc}
                alt={`Swish QR for ${payee}`}
                width={270}
                height={270}
                loading="lazy"
              />
              <div className="swishd-qr-brand">
                <span>Swish</span>
              </div>
            </div>
            <a className="swishd-open" href={swishUri}>
              {copy.open} →
            </a>
          </div>

          {/* Right — details + progress */}
          <div className="swishd-body">
            <p className="swishd-text">{copy.body}</p>

            <div className="swishd-number-row">
              <div>
                <div className="swishd-key">{copy.number}</div>
                <div className="swishd-number">{fmtSwishNumber(number)}</div>
                <div className="swishd-payee">{payee}</div>
              </div>
              <CopyButton value={number} labels={{ copy: copy.copy, copied: copy.copied }} />
            </div>

            <div className="swishd-meter">
              <div className="swishd-meter-head">
                <div className="swishd-meter-label">{goalLabel}</div>
                <div className="swishd-meter-val">
                  <strong>{fmtSek(raised)}</strong> {copy.of} {fmtSek(goal)}
                </div>
              </div>
              <div className="swishd-meter-track">
                <div className="swishd-meter-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="swishd-meter-pct">{pct}%</div>
            </div>

            <div className="swishd-thanks">{copy.thanks}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CopyButton({
  value,
  labels,
}: {
  value: string
  labels: { copy: string; copied: string }
}) {
  return (
    <button
      type="button"
      className="swishd-copy"
      onClick={(e) => {
        const btn = e.currentTarget
        navigator.clipboard?.writeText(value).then(() => {
          const orig = btn.textContent
          btn.textContent = labels.copied
          btn.classList.add('is-copied')
          setTimeout(() => {
            btn.textContent = orig
            btn.classList.remove('is-copied')
          }, 1600)
        })
      }}
    >
      {labels.copy}
    </button>
  )
}
