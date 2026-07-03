import { describe, expect, it } from 'vitest'
import type { SiteContent } from '../../content/types'
import {
  selectHistoriaHero,
  selectHistoriaNarrative,
  selectMvv,
} from './historiaSelectors'

const content = {
  site: { name: 'Projeto Liberdade', logo: '/images/logo.png', social: [] },
  navigation: [],
  pages: {
    historia: {
      slug: 'historia',
      title: 'História',
      hero: {
        title: 'Nossa História',
        subtitle: 'Desde 2006.',
      },
      body: [
        { type: 'image', src: '/images/historia.jpg', alt: 'Fundadores' },
        { type: 'paragraph', text: 'P1' },
        { type: 'paragraph', text: 'P2' },
        { type: 'quote', text: 'Q', author: 'André e Karina' },
      ],
      sections: [
        {
          slug: 'missao-visao-valores',
          title: 'Missão, Visão e Valores',
          body: [{ type: 'heading', text: 'Missão' }],
        },
      ],
    },
  },
} as unknown as SiteContent

describe('historiaSelectors', () => {
  it('selectHistoriaHero returns title, subtitle, image and alt', () => {
    const hero = selectHistoriaHero(content)
    expect(hero.title).toBe('Nossa História')
    expect(hero.subtitle).toBe('Desde 2006.')
    expect(hero.image).toBe('/images/historia-hero.jpg')
    expect(hero.alt.length).toBeGreaterThan(0)
  })

  it('selectHistoriaNarrative returns all paragraphs, the image and the quote', () => {
    const n = selectHistoriaNarrative(content)
    expect(n.paragraphs).toEqual(['P1', 'P2'])
    expect(n.image).toEqual({ src: '/images/historia.jpg', alt: 'Fundadores' })
    expect(n.quote).toEqual({ text: 'Q', author: 'André e Karina' })
  })

  it('re-exports selectMvv', () => {
    expect(selectMvv(content).heading).toBe('Missão, Visão e Valores')
  })
})
