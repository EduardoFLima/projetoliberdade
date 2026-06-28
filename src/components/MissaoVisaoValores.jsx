import { useState } from 'react'
import SectionHeading from './SectionHeading'

function extractParagraphs(section) {
  if (!section) return []
  return Object.entries(section)
    .filter(([key]) => key.startsWith('p'))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value.txts?.txt || value)
}

export default function MissaoVisaoValores({ data }) {
  const [activeTab, setActiveTab] = useState(0)

  if (!data) return null

  const tabs = [
    { id: 'missao', label: data.missao?.menuText || 'Missão', content: extractParagraphs(data.missao) },
    { id: 'visao', label: data.visao?.menuText || 'Visão', content: extractParagraphs(data.visao) },
    { id: 'valores', label: data.valores?.menuText || 'Valores', content: extractParagraphs(data.valores) },
  ]

  return (
    <section id="missao" className="py-(--spacing-section) px-4 sm:px-6 lg:px-8 bg-primary-50">
      <div className="max-w-4xl mx-auto">
        <SectionHeading className="mb-10">Missão, Visão e Valores</SectionHeading>

        {/* Tab list */}
        <div
          role="tablist"
          aria-label="Missão, Visão e Valores"
          className="flex justify-center gap-1 mb-8 bg-white rounded-lg p-1 shadow-sm max-w-md mx-auto"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === index}
              aria-controls={`panel-${tab.id}`}
              tabIndex={activeTab === index ? 0 : -1}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === index
                  ? 'bg-primary-700 text-white shadow-sm'
                  : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
              }`}
              onClick={() => setActiveTab(index)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') {
                  setActiveTab((activeTab + 1) % tabs.length)
                } else if (e.key === 'ArrowLeft') {
                  setActiveTab((activeTab - 1 + tabs.length) % tabs.length)
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== index}
            className="bg-white rounded-[var(--radius-card)] p-8 shadow-[var(--shadow-card)]"
          >
            <div className="space-y-4">
              {tab.content.map((text, i) => (
                <p key={i} className="text-neutral-600 leading-relaxed text-lg">
                  {text}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
