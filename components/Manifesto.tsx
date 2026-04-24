/**
 * Manifesto — the thesis statement. Placed near the end of the homepage,
 * right before JoinCTA, as the rallying crescendo that ties Malmö's
 * international identity to MBA's basketball mission.
 *
 * Editorial / pull-quote styling. Italic emphasis on *Malmö*, *MBA*, *family*,
 * *ifmba.se*. Reads well on dark or alt backgrounds.
 */
export default function Manifesto({
  num,
  numText,
  className,
}: {
  num?: string
  numText?: string
  className?: string
}) {
  return (
    <section
      className={`manifesto section ${className || ''}`.trim()}
      data-num={num}
      data-num-text={numText}
      id="manifesto"
    >
      <div className="contain">
        <div className="label r">Manifesto</div>
        <h2 className="title r">
          Malmös <em>sportsliga</em> motsvarighet
        </h2>

        <div className="manifesto-body r">
          <p>
            If <em>Malmö</em> is the engine of Sweden&rsquo;s modern, international
            identity, <em>MBA</em> is its sports equivalent. The city has
            transitioned from the heavy steel of shipyards to the high-tech twist of
            the Turning Torso &mdash; just as Malmö basketball has evolved from
            traditional club structures to the inclusive, high-performance{' '}
            <em>&ldquo;family&rdquo;</em> model championed by <em>MBA</em>.
          </p>
          <p>
            For anyone looking to engage with the city&rsquo;s athletic heart in
            2026, <em>ifmba.se</em> is the portal to its most dominant and diverse
            basketball movement.
          </p>
        </div>
      </div>
    </section>
  )
}
