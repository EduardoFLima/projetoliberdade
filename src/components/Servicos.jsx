import { useState } from 'react'

function extractServiceText(service) {
  return Object.entries(service)
    .filter(([key]) => key.startsWith('p'))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value.txts?.txt || value)
}

function ServiceCard({ service }) {
  const [expanded, setExpanded] = useState(false)
  const paragraphs = extractServiceText(service)
  const preview = paragraphs[0] || ''
  const cardId = `service-${service.menuText?.replace(/\s/g, '-').toLowerCase()}`

  return (
    <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6 flex flex-col">
      <h3 className="text-xl font-semibold text-neutral-900 mb-3">
        {service.menuText}
      </h3>
      <p className="text-neutral-600 leading-relaxed flex-1">
        {expanded ? paragraphs.join(' ') : preview}
      </p>
      {paragraphs.length > 1 && (
        <button
          type="button"
          className="mt-4 text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors self-start"
          aria-expanded={expanded}
          aria-controls={cardId}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Ver menos' : 'Ver mais'}
        </button>
      )}
    </div>
  )
}

export default function Servicos({ data }) {
  if (!data) return null

  const services = Object.entries(data)
    .filter(([key]) => key !== 'menuText' && key !== 'order')
    .map(([, value]) => value)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <section id="servicos" className="py-(--spacing-section) px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-center mb-12 font-[var(--font-heading)]">
        Nossos Serviços
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.menuText} service={service} />
        ))}
      </div>
    </section>
  )
}
