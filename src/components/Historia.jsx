import SectionHeading from './SectionHeading'

export default function Historia({ data }) {
  if (!data) return null

  const { historia } = data
  const paragraphs = Object.entries(historia)
    .filter(([key]) => key.startsWith('p'))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value.txts?.txt || value)

  return (
    <section id="historia" className="py-(--spacing-section) px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SectionHeading className="mb-12">
        {historia.titulo || 'Nossa História'}
      </SectionHeading>
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
