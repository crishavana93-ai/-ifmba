'use client'
import { useState } from 'react'
import Crest from './Crest'

/**
 * Footer — newsletter, quick links, contact, and socials.
 *
 * Social icons are inline SVGs (zero network cost, themeable via currentColor).
 * Each icon only renders if its matching URL is set in Sanity siteSettings,
 * so adding a platform later is a Studio edit — no deploy required.
 *
 * Editable URLs live in Studio under Site settings:
 *   instagramUrl · facebookUrl · tiktokUrl · youtubeUrl · contactEmail
 */

// ── Brand SVG icons ────────────────────────────────────────────────────
const IconInstagram = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)
const IconFacebook = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M13.5 21v-7.5h2.53l.38-2.94H13.5V8.7c0-.85.24-1.43 1.47-1.43h1.57V4.63a21 21 0 0 0-2.29-.12c-2.27 0-3.82 1.38-3.82 3.92v2.13H7.9v2.94h2.53V21h3.07Z" />
  </svg>
)
const IconTikTok = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M16.8 3.5c.08 1.13.48 2.2 1.16 3.09a4.98 4.98 0 0 0 3.04 1.77v3.12a8.09 8.09 0 0 1-4.2-1.26v6.17a5.9 5.9 0 1 1-5.9-5.9c.33 0 .66.03.98.08v3.2a2.82 2.82 0 1 0 1.94 2.68V3.5h2.98Z" />
  </svg>
)
const IconYouTube = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.77-1.77C18.23 5 12 5 12 5s-6.23 0-7.83.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.77 1.77C5.77 19 12 19 12 19s6.23 0 7.83-.43a2.5 2.5 0 0 0 1.77-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3-5.2 3Z" />
  </svg>
)
const IconMail = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
)

type IconFn = (p: { size?: number }) => JSX.Element

export default function Footer({ settings }: { settings: any }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (email && email.includes('@')) { setSubmitted(true); setEmail('') }
  }

  // Build the socials list from settings. Only platforms with a URL render.
  const socials: { label: string; url?: string; Icon: IconFn }[] = [
    { label: 'Instagram', url: settings?.instagramUrl, Icon: IconInstagram },
    { label: 'Facebook',  url: settings?.facebookUrl,  Icon: IconFacebook  },
    { label: 'TikTok',    url: settings?.tiktokUrl,    Icon: IconTikTok    },
    { label: 'YouTube',   url: settings?.youtubeUrl,   Icon: IconYouTube   },
  ]
  const contactEmail = settings?.contactEmail || 'mba.malmo.basket@gmail.com'

  return (
    <footer className="foot">
      <div className="contain">
        <div className="foot-grid">
          <div>
            <div className="foot-brand-row">
              <Crest size={56} />
              <div>
                <div className="foot-brand-name">MBA</div>
                <div className="foot-brand-tag">Malmö Basket Amatörer</div>
              </div>
            </div>
            <div className="foot-brand-sub">Malmös mest internationella basketfamilj. 9 nationer, 1 tröja. Uppflyttade till Div 2 Skåne Herr 2026/27.</div>
            <div className="foot-nl-wrap">
              <div className="foot-nl">
                <input type="email" placeholder="din@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                <button onClick={handleSubmit}>SKICKA</button>
              </div>
              {submitted && <div className="foot-nl-ok show">Tack! Du är nu med i MBA-familjen.</div>}
            </div>
            <div className="foot-socials" style={{ marginTop: '18px' }}>
              {socials
                .filter((s) => !!s.url)
                .map(({ label, url, Icon }) => (
                  <a
                    key={label}
                    className="foot-soc"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`MBA on ${label}`}
                    title={label}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              <a
                className="foot-soc"
                href={`mailto:${contactEmail}`}
                aria-label="Email MBA"
                title="Email"
              >
                <IconMail size={18} />
              </a>
            </div>
          </div>
          <div>
            <div className="foot-col-h">Snabblänkar</div>
            <div className="foot-links">
              <a onClick={() => document.getElementById('news')?.scrollIntoView({behavior:'smooth'})}>Nyheter</a>
              <a onClick={() => document.getElementById('standings')?.scrollIntoView({behavior:'smooth'})}>Tabell</a>
              <a onClick={() => document.getElementById('squad')?.scrollIntoView({behavior:'smooth'})}>Trupp</a>
              <a onClick={() => document.getElementById('courts')?.scrollIntoView({behavior:'smooth'})}>Courts</a>
              <a onClick={() => document.getElementById('sponsors')?.scrollIntoView({behavior:'smooth'})}>Partners</a>
            </div>
          </div>
          <div>
            <div className="foot-col-h">Kontakt</div>
            <div className="foot-links">
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              <a href="https://www.profixio.com/app/leagueid16181" target="_blank" rel="noopener">Profixio</a>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 MBA · Malmö Basket</span>
          <a href="https://www.profixio.com/app/leagueid16181" target="_blank" rel="noopener">Powered by Profixio</a>
        </div>
      </div>
    </footer>
  )
}
