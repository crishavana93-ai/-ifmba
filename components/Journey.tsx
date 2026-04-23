/**
 * Journey — the MBA origin timeline (2020 → today).
 *
 * Hard-coded milestones. When the club wants to add new ones, edit the MILESTONES
 * array below. We didn't put this in Sanity because it changes at most once a year.
 *
 * Renders as a vertical rail on desktop, a single column on mobile.
 * Styled by the `.journey` rules in src/styles/mba.css.
 */

type Milestone = {
  year: string
  title: string
  body: string
  badge?: string
}

const MILESTONES: Milestone[] = [
  {
    year: '2020',
    badge: '🏀 Start',
    title: 'En boll, en dröm',
    body:
      'MBA grundas i Malmö av ett gäng vänner med olika bakgrund men samma passion. ' +
      'Första träningen: sju spelare, en utomhuskorg, och ingen uniform.',
  },
  {
    year: '2022',
    badge: '🌍 Familjen växer',
    title: '9 nationer, 1 tröja',
    body:
      'Laget expanderar till nio nationaliteter. Vi registrerar oss hos Skånes ' +
      'basketdistrikt och spelar vår första officiella seriesäsong.',
  },
  {
    year: '2024',
    badge: '🏆 Genombrottet',
    title: 'Obesegrade i Division 3',
    body:
      'MBA går genom hela säsongen utan förlust. Bli-en-del-av-familjen-kampanjen drar ' +
      'ny publik till hemmamatcherna på Universitetshallen.',
  },
  {
    year: '2026',
    badge: '✨ Nästa kapitel',
    title: 'Skånes mest internationella lag',
    body:
      'Ny hemmaarena, ny sponsorstege, första damlaget under planering. ' +
      'Målet: spela upp till Division 2 och fortsätta bygga familjen.',
  },
]

export default function Journey({ num, numText, className }: { num?: string; numText?: string; className?: string } = {}) {
  return (
    <section className={`journey section ${className || ''}`.trim()} data-num={num} data-num-text={numText} id="journey">
      <div className="contain">
        <div className="label r">Resan</div>
        <h2 className="title r">
          Från en boll till en <em>familj</em>
        </h2>

        <ol className="jny-rail">
          {MILESTONES.map((m, i) => (
            <li key={m.year} className="jny-item r" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="jny-year">{m.year}</div>
              <div className="jny-card">
                {m.badge && <div className="jny-badge">{m.badge}</div>}
                <h3 className="jny-title">{m.title}</h3>
                <p className="jny-body">{m.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
