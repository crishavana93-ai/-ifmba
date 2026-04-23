export default function About({ settings }: { settings: any }) {
  const flags = [
    { emoji: '🇸🇪', name: 'Sverige' }, { emoji: '🇬🇷', name: 'Grekland' },
    { emoji: '🇪🇷', name: 'Eritrea' }, { emoji: '🇳🇬', name: 'Nigeria' },
    { emoji: '🇲🇽', name: 'Mexiko' }, { emoji: '🇵🇭', name: 'Filippinerna' },
    { emoji: '🇬🇭', name: 'Ghana' }, { emoji: '🇹🇳', name: 'Tunisien' },
  ]

  return (
    <section className="about section">
      <div className="contain about-inner">
        <div className="label r">Identitet</div>
        <h2 className="about-quote r">Inte bara ett lag.<br /><em>En familj. En rörelse.</em></h2>
        <p className="about-body r" dangerouslySetInnerHTML={{
          __html: settings?.aboutTextSv || 'MBA startade <strong>2020</strong> med en boll och en dröm i Malmö. Idag bär vi <strong>8 nationers flaggor</strong> på samma tröja — byggt på gemenskap, disciplin och kärlek till spelet.'
        }} />
        <div className="flags r">
          {flags.map(f => <span key={f.name} className="flag">{f.emoji} {f.name}</span>)}
        </div>
      </div>
    </section>
  )
}
