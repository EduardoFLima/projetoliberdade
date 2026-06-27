import { useState } from 'react'
import hippussuitImage from '../assets/hippussuit.png'

const COLLAPSE_THRESHOLD = 5

function numericSuffix(key) {
  const match = key.match(/(\d+)$/)
  return match ? parseInt(match[1], 10) : 1
}

function paragraphs(block) {
  if (!block?.txts) return []
  return Object.entries(block.txts)
    .filter(([key, value]) => key.startsWith('txt') && typeof value === 'string')
    .sort(([a], [b]) => numericSuffix(a) - numericSuffix(b))
    .map(([, value]) => value)
}

function listItems(block) {
  const ul = block?.txts?.ul
  if (!ul) return []
  return Object.entries(ul)
    .sort(([a], [b]) => numericSuffix(a) - numericSuffix(b))
    .map(([, value]) => value)
}

function BenefitCard({ heading, items }) {
  const [expanded, setExpanded] = useState(false)
  const collapsible = items.length > COLLAPSE_THRESHOLD
  const visible = expanded || !collapsible ? items : items.slice(0, COLLAPSE_THRESHOLD)
  const listId = `hippussuit-list-${heading.slice(0, 24).replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">{heading}</h3>
      <ul id={listId} className="space-y-2">
        {visible.map((item, index) => (
          <li key={index} className="flex gap-2 text-neutral-600 leading-relaxed">
            <span className="text-primary-600 flex-shrink-0" aria-hidden="true">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {collapsible && (
        <button
          type="button"
          className="mt-4 text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Ver menos' : 'Ver mais'}
        </button>
      )}
    </div>
  )
}

export default function Hippussuit({ data }) {
  if (!data?.hippussuit) return null

  const { hippussuit } = data
  const motor = hippussuit.p2
  const behavioral = hippussuit.p3
  const credits = hippussuit.p5

  return (
    <section id="hippussuit" className="py-(--spacing-section) px-4 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-center mb-12 font-[var(--font-heading)]">
          {hippussuit.titulo || 'Hippussuit'}
        </h2>

        {/* Intro + feature image */}
        <div className="flex flex-col md:flex-row items-start gap-8 mb-16">
          <div className="w-full md:w-1/3 flex-shrink-0">
            <img
              src={hippussuitImage}
              alt="Praticante utilizando o HippusSuit durante a montaria"
              className="w-full rounded-[var(--radius-card)] shadow-[var(--shadow-card)] object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1 space-y-4">
            {paragraphs(hippussuit.p1).map((text, index) => (
              <p key={index} className="text-neutral-600 leading-relaxed text-lg">{text}</p>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <BenefitCard heading={paragraphs(motor)[0] || ''} items={listItems(motor)} />
          <BenefitCard heading={paragraphs(behavioral)[0] || ''} items={listItems(behavioral)} />
        </div>

        {/* Conclusion */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          {paragraphs(hippussuit.p4).map((text, index) => (
            <p key={index} className="text-neutral-600 leading-relaxed text-lg">{text}</p>
          ))}
        </div>

        {/* Credits */}
        {credits && (
          <div className="max-w-2xl mx-auto bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6 text-center">
            <h3 className="text-base font-semibold text-neutral-900 mb-3">
              {paragraphs(credits)[0] || ''}
            </h3>
            <ul className="space-y-1 text-neutral-600">
              {listItems(credits).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
