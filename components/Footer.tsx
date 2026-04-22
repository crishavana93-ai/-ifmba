'use client'
import { useState } from 'react'

export default function Footer({ settings }: { settings: any }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (email && email.includes('@')) { setSubmitted(true); setEmail('') }
  }

  return (
    <footer className="foot">
      <div className="contain">
        <div className="foot-grid">
          <div>
            <div className="foot-brand-name">MBA</div>
            <div className="foot-brand-sub">Malmö Basket Amatörer — Malmös mest internationella basketfamilj. 8 nationer, 1 tröja.</div>
            <div className="foot-nl-wrap">
              <div className="foot-nl">
                <input type="email" placeholder="din@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                <button onClick={handleSubmit}>SKICKA</button>
              </div>
              {submitted && <div className="foot-nl-ok show">Tack! Du är nu med i MBA-familjen.</div>}
            </div>
            <div className="foot-socials" style={{ marginTop: '18px' }}>
              {settings?.instagramUrl && <a className="foot-soc" href={settings.instagramUrl} target="_blank" rel="noopener">IG</a>}
              <a className="foot-soc" href={`mailto:${settings?.contactEmail || 'mba.malmo.basket@gmail.com'}`}>@</a>
            </div>
          </div>
          <div>
            <div className="foot-col-h">Snabblänkar</div>
            <div className="foot-links">
              <a onClick={() => document.getElementById('standings')?.scrollIntoView({behavior:'smooth'})}>Tabell</a>
              <a onClick={() => document.getElementById('squad')?.scrollIntoView({behavior:'smooth'})}>Trupp</a>
              <a onClick={() => document.getElementById('courts')?.scrollIntoView({behavior:'smooth'})}>Courts</a>
              <a onClick={() => document.getElementById('sponsors')?.scrollIntoView({behavior:'smooth'})}>Partners</a>
            </div>
          </div>
          <div>
            <div className="foot-col-h">Kontakt</div>
            <div className="foot-links">
              <a href={`mailto:${settings?.contactEmail || 'mba.malmo.basket@gmail.com'}`}>{settings?.contactEmail || 'mba.malmo.basket@gmail.com'}</a>
              <a href="https://www.profixio.com/app/leagueid16182/category/1150620" target="_blank" rel="noopener">Profixio</a>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 MBA · Malmö Basket Amatörer</span>
          <a href="https://www.profixio.com/app/leagueid16182/category/1150620" target="_blank" rel="noopener">Powered by Profixio</a>
        </div>
      </div>
    </footer>
  )
}
