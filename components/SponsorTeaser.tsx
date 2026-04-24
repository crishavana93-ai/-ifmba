/**
 * SponsorTeaser — compact, editorial landing-page module that replaces the
 * full Sponsors section on `/`. Routes traffic to /partners for the full
 * tier breakdown + lead form.
 *
 * Stays intentionally short — a headline, one proof-point row, one CTA.
 * No tier cards here; their home is the dedicated page.
 */
import Link from 'next/link'

type Props = {
  sponsorCount?: number
  num?: string
  numText?: string
  className?: string
}

export default function SponsorTeaser({
  sponsorCount = 0,
  num,
  numText,
  className,
}: Props) {
  return (
    <section
      className={`sponsor-teaser section section-alt ${className || ''}`.trim()}
      data-num={num}
      data-num-text={numText}
      id="sponsors"
    >
      <div className="contain sponsor-teaser-inner">
        <div className="label r">Partners</div>

        <h2 className="title r">
          Stå där <em>laget</em> står.
        </h2>

        <p className="sponsor-teaser-body r">
          MBA är Malmös mest internationella basketklubb — <strong>9 nationer,
          1 tröja</strong> — och vi går in i 2026/27 som nyuppflyttade till
          Div&nbsp;2 Skåne Herr. Er logga på matchtröjan, bänksidan, hemsidan och
          i matchklippen. Paket från <strong>10&nbsp;000 kr</strong> till
          <strong> 75&nbsp;000 kr</strong> per tvåårsavtal.
        </p>

        <div className="sponsor-teaser-stats r">
          <div>
            <span className="sts-num">9</span>
            <span className="sts-lbl">nationer</span>
          </div>
          <div>
            <span className="sts-num">Div 2</span>
            <span className="sts-lbl">uppflyttade 2026/27</span>
          </div>
          <div>
            <span className="sts-num">4</span>
            <span className="sts-lbl">partnerpaket</span>
          </div>
          {sponsorCount > 0 && (
            <div>
              <span className="sts-num">{sponsorCount}</span>
              <span className="sts-lbl">nuvarande partners</span>
            </div>
          )}
        </div>

        <div className="sponsor-teaser-cta r">
          <Link href="/partners#lead" className="btn-cta">
            Bli sponsor — skicka förfrågan →
          </Link>
          <Link href="/anslut" className="btn-cta btn-cta-ghost">
            Spela för MBA
          </Link>
        </div>
      </div>
    </section>
  )
}
