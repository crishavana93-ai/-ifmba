'use client'
export default function Marquee() {
  const items = ['MBA BASKETBALL','MALMÖ, SVERIGE','#1 I TABELLEN','5–0 RECORD','8 NATIONS · 1 TEAM','JOIN THE FAMILY','PROFIXIO LIVE']
  const doubled = [...items, ...items]

  return (
    <div className="marquee">
      <div className="marquee-track">
        {doubled.map((text, i) => (
          <span key={i} className="marquee-item">{text}<span className="marquee-dot" /></span>
        ))}
      </div>
    </div>
  )
}
