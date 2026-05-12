'use client'
/**
 * GearDonations — in-kind donations of basketball gear for international
 * communities in need. Companion to <Swish> (money).
 *
 * Pattern: donor reads the pitch + sees a photo gallery showing where the
 * gear ends up, taps "Email MBA" → opens their mail client with a pre-filled
 * subject. WhatsApp is offered as a secondary option only when the number is
 * set in Sanity.
 *
 * Photo gallery pulls from Sanity `mediaAsset` documents tagged
 * `category: 'community'`. Cris uploads photos via Studio → they appear here
 * with no code change.
 *
 * Stats panel under the CTAs shows what the club has collected & distributed.
 * Numbers are edited by hand in Sanity Studio (Site Settings → Gear Stats).
 * Setting all four to 0 hides the stats grid so the section never shows a
 * row of zeros.
 *
 * Hides itself entirely if both `gearContactEmail` and `gearWhatsappNumber`
 * are empty.
 *
 * Country attribution intentionally omitted — copy refers to "international
 * basketball communities" without naming specific locations, per Cris's note
 * on 2026-05-12.
 */

import { useLang } from '@/lib/i18n'

type Settings = {
  gearContactEmail?: string
  gearWhatsappNumber?: string
  gearMessageSv?: string
  gearMessageEn?: string
  gearStatShoesCount?: number
  gearStatBallsCount?: number
  gearStatClothesCount?: number
  gearStatKitsCount?: number
}

type MediaRow = {
  _id: string
  kind?: 'photo' | 'video'
  category?: string
  title?: string
  captionSv?: string
  captionEn?: string
  imageUrl?: string | null
}

function fmtCount(n: number) {
  return new Intl.NumberFormat('sv-SE').format(n)
}

export default function GearDonations({
  settings,
  media = [],
  num,
  numText,
  className,
}: {
  settings: Settings | null | undefined
  /** Full media list — filtered client-side to category='community'. */
  media?: MediaRow[]
  num?: string
  numText?: string
  className?: string
}) {
  const { lang } = useLang()

  const email = (settings?.gearContactEmail || '').trim()
  const waNumber = (settings?.gearWhatsappNumber || '').replace(/\D/g, '')
  if (!email && !waNumber) return null

  const subjectSv = settings?.gearMessageSv || 'Donera utrustning till MBA'
  const subjectEn = settings?.gearMessageEn || 'Donate basketball gear to MBA'
  const subject = lang === 'en' ? subjectEn : subjectSv

  const bodySv =
    'Hej MBA,\n\nJag vill donera följande utrustning till klubben:\n\n- \n- \n\nJag finns i [stad / plats] och kan lämna av / skicka.\n\nTack!'
  const bodyEn =
    "Hi MBA,\n\nI'd like to donate the following basketball gear:\n\n- \n- \n\nI'm in [city / location] and can drop off / ship.\n\nThanks!"
  const body = lang === 'en' ? bodyEn : bodySv

  const mailto = email
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : null
  const waUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(subject)}`
    : null

  const photos = media
    .filter((m) => m.category === 'community' && m.kind !== 'video' && m.imageUrl)
    .slice(0, 6)

  const shoes = Math.max(0, settings?.gearStatShoesCount ?? 0)
  const balls = Math.max(0, settings?.gearStatBallsCount ?? 0)
  const clothes = Math.max(0, settings?.gearStatClothesCount ?? 0)
  const kits = Math.max(0, settings?.gearStatKitsCount ?? 0)
  const hasStats = shoes + balls + clothes + kits > 0

  const copy =
    lang === 'en'
      ? {
          eyebrow: 'Donate gear',
          title: 'Give kit',
          titleEm: 'a second life',
          body:
            'Old basketball shoes, jerseys, t-shirts, balls — anything basketball-related. We forward donated gear to international basketball communities where access to equipment is the difference between playing and not playing. Email us and we’ll arrange drop-off or shipping.',
          ctaEmail: 'Email MBA',
          ctaWa: 'WhatsApp',
          notes:
            'A photo of the gear in your first email helps us match it to the right players faster.',
          statsHead: 'Collected & distributed so far',
          shoes: 'Shoes',
          balls: 'Basketballs',
          clothes: 'Clothing items',
          kits: 'Kits distributed',
          galleryLabel: 'Where the gear goes',
        }
      : {
          eyebrow: 'Donera utrustning',
          title: 'Ge utrustning',
          titleEm: 'ett nytt liv',
          body:
            'Gamla basketskor, tröjor, t-shirts, bollar — allt basketrelaterat. Vi skickar donerad utrustning vidare till internationella basketgemenskaper där tillgång till utrustning är skillnaden mellan att spela och att inte spela. Maila oss så bokar vi avlämning eller frakt.',
          ctaEmail: 'Maila MBA',
          ctaWa: 'WhatsApp',
          notes:
            'En bild på utrustningen i första mailet hjälper oss att matcha den till rätt spelare snabbare.',
          statsHead: 'Insamlat & utdelat hittills',
          shoes: 'Par skor',
          balls: 'Basketbollar',
          clothes: 'Klädesplagg',
          kits: 'Utdelade utrustningspaket',
          galleryLabel: 'Dit utrustningen går',
        }

  const stats = [
    { label: copy.shoes, val: shoes, icon: 'shoe' },
    { label: copy.balls, val: balls, icon: 'ball' },
    { label: copy.clothes, val: clothes, icon: 'shirt' },
    { label: copy.kits, val: kits, icon: 'kit' },
  ]

  return (
    <section
      className={`gear-donations section ${className || ''}`.trim()}
      data-num={num}
      data-num-text={numText}
      id="utrustning"
    >
      <div className="contain">
        <div className="label">{copy.eyebrow}</div>
        <h2 className="title">
          {copy.title} <em>{copy.titleEm}</em>
        </h2>

        <div className="gd-grid">
          <div className="gd-body">
            <p className="gd-text">{copy.body}</p>

            <div className="gd-ctas">
              {mailto && (
                <a className="gd-cta gd-cta-email" href={mailto}>
                  <MailIcon />
                  <span>
                    {copy.ctaEmail} <em className="gd-cta-addr">{email}</em>
                  </span>
                </a>
              )}
              {waUrl && (
                <a className="gd-cta gd-cta-wa" href={waUrl} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon />
                  <span>{copy.ctaWa}</span>
                </a>
              )}
            </div>

            <div className="gd-notes">{copy.notes}</div>
          </div>

          {hasStats && (
            <div className="gd-stats">
              <div className="gd-stats-head">{copy.statsHead}</div>
              <div className="gd-stats-grid">
                {stats.map((s) => (
                  <div key={s.icon} className="gd-stat">
                    <span className={`gd-stat-icon gd-icon-${s.icon}`} aria-hidden="true">
                      {iconGlyph(s.icon)}
                    </span>
                    <div className="gd-stat-val">{fmtCount(s.val)}</div>
                    <div className="gd-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {photos.length > 0 && (
          <div className="gd-gallery-wrap">
            <div className="gd-gallery-label">{copy.galleryLabel}</div>
            <div className="gd-gallery">
              {photos.map((p) => (
                <figure key={p._id} className="gd-photo">
                  <img
                    src={p.imageUrl!}
                    alt={(lang === 'en' ? p.captionEn : p.captionSv) || p.title || ''}
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M20.5 3.5A11.94 11.94 0 0 0 12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.1 1.6 5.9L0 24l6.3-1.6c1.7.9 3.6 1.5 5.7 1.5 6.6 0 12-5.4 12-12 0-3.2-1.3-6.2-3.5-8.4ZM12 22a10 10 0 0 1-5.1-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A10 10 0 1 1 12 22Zm5.6-7.5c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1a8.1 8.1 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2c-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5l.3-.4c.1-.2 0-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.2 0 1.3 1 2.5 1.1 2.7.1.2 1.9 2.9 4.6 4.1 2.7 1.1 2.7.7 3.2.7s1.5-.6 1.7-1.2c.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3Z" />
    </svg>
  )
}

function iconGlyph(name: string) {
  switch (name) {
    case 'shoe':
      return '\u{1F45F}' // 👟
    case 'ball':
      return '\u{1F3C0}' // 🏀
    case 'shirt':
      return '\u{1F455}' // 👕
    case 'kit':
      return '\u{1F396}' // 🎖
    default:
      return '•'
  }
}
