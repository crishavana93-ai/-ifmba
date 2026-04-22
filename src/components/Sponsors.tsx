export default function Sponsors({ sponsors }: { sponsors: any[] }) {
  const tiers = ['Platinum', 'Gold', 'Silver', 'Bronze']

  return (
    <section className="sponsors section" id="sponsors">
      <div className="contain">
        <div className="label r">Partners</div>
        <h2 className="title r">Sponsorer</h2>
        <div className="tiers" style={{ marginTop: 'clamp(24px,3vw,40px)' }}>
          {tiers.map(tier => (
            <div key={tier} className={`tier tier-${tier.toLowerCase()}`}>
              <div className="tier-name">{tier}</div>
              <div className="tier-price">
                {tier === 'Platinum' ? '25 000 kr/sas' : tier === 'Gold' ? '15 000 kr/sas' : tier === 'Silver' ? '8 000 kr/sas' : '3 000 kr/sas'}
              </div>
              {sponsors.filter(s => s.tier === tier).map(s => (
                <div key={s._id} style={{ padding: '8px', color: 'var(--body-text)', fontSize: '13px' }}>
                  {s.website ? <a href={s.website} target="_blank" rel="noopener">{s.name}</a> : s.name}
                </div>
              ))}
              {sponsors.filter(s => s.tier === tier).length === 0 && (
                <div style={{ padding: '16px', color: 'var(--muted)', fontSize: '12px', letterSpacing: '0.1em' }}>AVAILABLE</div>
              )}
            </div>
          ))}
        </div>
        <div className="sp-cta r">
          <h3>Redo att bli <em>en del av MBA?</em></h3>
          <p>Kontakta oss. Begränsat antal platser denna säsong.</p>
          <a className="btn-cta" href="mailto:mba.malmo.basket@gmail.com">Kontakta oss</a>
        </div>
      </div>
    </section>
  )
}
