export default function Courts({ courts }: { courts: any[] }) {
  return (
    <section className="courts section" id="courts">
      <div className="contain">
        <div className="label r">Malmö Basketball Map</div>
        <h2 className="title r">The <em>Courts</em></h2>
        <div className="court-list" style={{ marginTop: 'clamp(24px,3vw,40px)' }}>
          {courts.map((c: any) => (
            <div key={c._id} className="court-card r">
              <div className="court-name">{c.name}</div>
              <div className="court-type">{c.type}{c.isHome ? ' · Hemmaarena' : ''}</div>
              <div className="court-addr">{c.address}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
