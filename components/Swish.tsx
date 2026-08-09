'use client'
/**
 * Swish — the club's PAYMENT rail.
 *
 * Reframed 2026-08-03 (Cris): Swish is NOT a donation box. It's how members
 * pay the club — membership fees, training fees, team fees. The old
 * fundraising meter ("Insamlat X av Y kr") and donation language are gone;
 * in their place is a fee table (matching /anslut pricing) so people know
 * exactly what to pay and what to write in the message field.
 *
 * Swish is the dominant person-to-person payment rail in Sweden — 8M+
 * users, ~70% of the population. We surface the club's Swish number plus a
 * scannable QR that auto-fills the recipient + a pre-filled message so
 * payments are easy to reconcile.
 *
 * Config lives in Sanity `siteSettings`:
 *   swishNumber, swishPayee, swishMessage
 *
 * If `swishNumber` is empty, the whole component renders null so the page
 * doesn't show a half-broken block on a fresh install.
 *
 * QR encoding: Swish C-format (Cnumber;amount;message;lockmask) wrapped in
 * the swish:// URI most Swedish banking apps recognise. Amount slot left
 * empty so the payer types their own fee amount. QR image generated via
 * the public api.qrserver.com endpoint to avoid adding a dependency.
 */

import { useLang } from '@/lib/i18n'

type Settings = {
  swishNumber?: string
  swishPayee?: string
  swishMessage?: string
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
  if (!number) return null // hide entirely until the club Swish number is set

  const payee = settings?.swishPayee || 'MBA Malmö Basket'
  const message = (settings?.swishMessage || 'MBA').replace(/;/g, ' ')

  // Swish payment URI — opens the Swish app with recipient + message
  // prefilled. C-format: C<number>;<amount>;<message>;<lockmask>.
  // Amount left empty on purpose — the payer fills in their fee.
  const payload = `C${number};;${message};0`
  const swishUri = `swish://payment?data=${encodeURIComponent(payload)}`
  // Public QR image — encodes the swish:// URI. ~270×270 PNG.
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=270x270&margin=2&data=${encodeURIComponent(swishUri)}`

  const copy = lang === 'en'
    ? {
        eyebrow: 'Payments',
        title: 'Pay via Swish',
        titleEm: 'in 10 seconds',
        body: `All club payments go through one Swish number — membership, practice and team fees. Scan the QR with your Swish app or send to the number below. Write your name + what the payment is for in the message so we can match it.`,
        number: 'Swish number',
        copy: 'Copy number',
        copied: 'Copied',
        open: 'Open Swish',
        feesHead: 'Current fees',
        fees: [
          { name: 'Casual Games (per term)', amount: '750 kr', msg: 'Your name + "Casual"' },
          { name: 'Div 2 squad (per season)', amount: '2 000 kr', msg: 'Your name + "Div 2"' },
          { name: 'Other (gear, travel, support)', amount: 'Any amount', msg: 'Your name + purpose' },
        ],
        feeMsgLabel: 'Message',
        note: 'Questions about your fee? Email the club before paying.',
      }
    : {
        eyebrow: 'Betalningar',
        title: 'Betala via Swish',
        titleEm: 'på 10 sekunder',
        body: `Alla klubbens betalningar går via ett Swish-nummer — medlems-, tränings- och lagavgifter. Skanna QR-koden med Swish-appen eller skicka till numret nedan. Skriv ditt namn + vad betalningen gäller i meddelandet så kan vi matcha den.`,
        number: 'Swish-nummer',
        copy: 'Kopiera numret',
        copied: 'Kopierat',
        open: 'Öppna Swish',
        feesHead: 'Aktuella avgifter',
        fees: [
          { name: 'Casual Games (per termin)', amount: '750 kr', msg: 'Ditt namn + ”Casual”' },
          { name: 'Div 2-truppen (per säsong)', amount: '2 000 kr', msg: 'Ditt namn + ”Div 2”' },
          { name: 'Övrigt (utrustning, resor, stöd)', amount: 'Valfritt belopp', msg: 'Ditt namn + ändamål' },
        ],
        feeMsgLabel: 'Meddelande',
        note: 'Osäker på din avgift? Maila klubben innan du betalar.',
      }

  return (
    <section
      className={`swishd section ${className || ''}`.trim()}
      data-num={num}
      data-num-text={numText}
      id="betala"
    >
      {/* Legacy anchor — old links/posters point at #donera. */}
      <span id="donera" aria-hidden="true" />
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
                alt={`Swish QR — ${payee}`}
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

          {/* Right — details + fee table */}
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

            {/* Fee table — replaces the old donation meter. Amounts mirror
                /anslut; update both together. */}
            <div className="swishd-fees" id="avgifter">
              <div className="swishd-key" style={{ marginBottom: 10 }}>{copy.feesHead}</div>
              {copy.fees.map((f) => (
                <div
                  key={f.name}
                  className="swishd-fee-row"
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    gap: 12, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{f.name}</div>
                    <div style={{ fontSize: '0.82em', opacity: 0.7 }}>
                      {copy.feeMsgLabel}: {f.msg}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{f.amount}</div>
                </div>
              ))}
            </div>

            <div className="swishd-thanks">{copy.note}</div>
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
