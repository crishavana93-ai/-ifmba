type Tier = {
  key: 'Platinum' | 'Gold' | 'Silver' | 'Bronze'
  nameSv: string
  price: string
  benefits: string[]
}

const TIERS: Tier[] = [
  {
    key: 'Platinum',
    nameSv: 'Platinum',
    price: '25 000 kr',
    benefits: [
      'Logo på matchtröjans framsida',
      'Huvudplacering på ifmba.se',
      'Branding på allt matchinnehåll',
      '10 VIP-matchbiljetter / säsong',
      'Kvartalsvisa feature-inlägg (IG)',
      'Företagsträning — 1× per år',
    ],
  },
  {
    key: 'Gold',
    nameSv: 'Guld',
    price: '15 000 kr',
    benefits: [
      'Logo på matchtröjans baksida',
      'Featured-placering på webben',
      'LED/banner på hemmamatcher',
      '6 matchbiljetter / säsong',
      'Sociala media-omnämnanden',
    ],
  },
  {
    key: 'Silver',
    nameSv: 'Silver',
    price: '8 000 kr',
    benefits: [
      'Logo på uppvärmningströjor',
      'Listad på sponsorsidan',
      '4 matchbiljetter / säsong',
      'Co-branded inlägg — 2× / år',
    ],
  },
  {
    key: 'Bronze',
    nameSv: 'Brons',
    price: '3 000 kr',
    benefits: [
      'Logo i sponsorsektionen',
      'Nämnd i nyhetsbrevet',
      '2 matchbiljetter / säsong',
    ],
  },
]

export default function Sponsors({ sponsors, num, numText, className }: { sponsors: any[]; num?: string; numText?: string; className?: string }) {
  return (
    <section className={`sponsors section ${className || ''}`.trim()} data-num={num} data-num-text={numText} id="sponsors">
      <div className="contain">
        <div className="label r">Partners</div>
        <h2 className="title r">Bli en del av <em>familjen</em></h2>

        <p className="sp-intro r">
          MBA är <strong>Malmös mest internationella basketlag</strong> — 9 nationer, 1 tröja,
          en oslagen säsong. Vi växer snabbt i Skåne och söker partners som delar värderingarna:
          gemenskap, disciplin och kärleken till spelet.
          Nå en internationell publik, stötta lokal idrott, och bli synlig där det händer.
        </p>

        <div className="tiers" style={{ marginTop: 'clamp(24px,3vw,40px)' }}>
          {TIERS.map((tier) => {
            const taken = sponsors.filter((s) => s.tier === tier.key)
            const isAvailable = taken.length === 0

            return (
              <div key={tier.key} className={`tier tier-${tier.key.toLowerCase()} r`}>
                <div className="tier-name">{tier.nameSv}</div>
                <div className="tier-price">
                  {tier.price}
                  <small>/ säsong</small>
                </div>

                <ul className="tier-benefits">
                  {tier.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>

                {isAvailable ? (
                  <div className="tier-availability">Platser tillgängliga</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {taken.map((s) => (
                      <div
                        key={s._id}
                        style={{ fontSize: '13px', color: 'var(--ink)' }}
                      >
                        {s.website ? (
                          <a href={s.website} target="_blank" rel="noopener">
                            {s.name}
                          </a>
                        ) : (
                          s.name
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <a
                  className="tier-cta"
                  href={`mailto:mba.malmo.basket@gmail.com?subject=MBA%20${tier.key}%20Partnership`}
                >
                  Boka samtal
                </a>
              </div>
            )
          })}
        </div>

        <div className="sp-cta r">
          <h3>
            Redo att bli <em>synlig</em> med MBA?
          </h3>
          <p>
            Vi skräddarsyr paket efter era mål. Kontakta oss — vi återkommer inom 48 timmar
            med en prospect deck och ett öppet samtal.
          </p>
          <a
            className="btn-cta"
            href="mailto:mba.malmo.basket@gmail.com?subject=MBA%20Partnership%20Inquiry"
          >
            Kontakta oss
          </a>
        </div>
      </div>
    </section>
  )
}
