import { describe, expect, it } from 'vitest'
import content from './content.json'

const expectedIcons: Record<string, string> = {
  equoterapia: 'horse-therapy',
  'equitacao-classica': 'riding-helmet',
  'equitacao-ludica': 'horseshoe',
  'equitacao-adaptada': 'adapted-riding',
  'pet-terapia': 'paw',
  hidroterapia: 'swimmer',
  'reabilitacao-neurofuncional': 'neuro',
}

describe('content.json service icons', () => {
  const sections = (content.pages.servicos as { sections: Array<{ slug: string; icon?: string }> }).sections

  it('assigns the expected icon key to each service', () => {
    for (const [slug, icon] of Object.entries(expectedIcons)) {
      const section = sections.find((s) => s.slug === slug)
      expect(section, `missing section ${slug}`).toBeDefined()
      expect(section?.icon).toBe(icon)
    }
  })

  it('does not add an icon to the hippussuit section', () => {
    const hippussuit = sections.find((s) => s.slug === 'hippussuit')
    expect(hippussuit?.icon).toBeUndefined()
  })
})
