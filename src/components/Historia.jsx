export default function Historia({ data }) {
  if (!data) return null

  const { historia } = data
  const paragraphs = Object.entries(historia)
    .filter(([key]) => key.startsWith('p'))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value.txts?.txt || value)

  return (
    <section id="historia" className="py-(--spacing-section) px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-center mb-12 font-[var(--font-heading)]">
        {historia.titulo || 'Nossa História'}
      </h2>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {paragraphs.map((text, index) => (
          <div key={index} className="text-neutral-600 leading-relaxed text-lg">
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
