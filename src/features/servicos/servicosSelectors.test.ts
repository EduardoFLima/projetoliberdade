import { describe, expect, it } from 'vitest'
import type { SiteContent } from '../../content/types'
import { selectHippussuit, selectServicesGrid } from './servicosSelectors'

const content = {
  pages: {
    servicos: {
      slug: 'servicos',
      title: 'Serviços',
      body: [{ type: 'paragraph', text: 'Equipe multidisciplinar.' }],
      sections: [
        {
          slug: 'equoterapia',
          title: 'Equoterapia',
          order: 1,
          body: [{ type: 'paragraph', text: 'Método terapêutico.' }],
        },
        {
          slug: 'hidroterapia',
          title: 'Hidroterapia',
          order: 6,
          body: [{ type: 'paragraph', text: 'Terapia aquática.' }],
        },
        {
          slug: 'hippussuit',
          title: 'Hippussuit',
          order: 9,
          body: [
            { type: 'image', src: 'placeholder.jpg', alt: '' },
            { type: 'paragraph', text: 'Intro do HippusSuit.' },
            { type: 'paragraph', text: 'Segundo parágrafo.' },
            { type: 'list', items: ['A', 'B', 'C', 'D', 'E'] },
            { type: 'list', items: ['Comportamental 1'] },
          ],
        },
      ],
    },
  },
} as unknown as SiteContent

describe('selectServicesGrid', () => {
  it('excludes hippussuit, sorts by order, and builds card links', () => {
    const grid = selectServicesGrid(content)
    expect(grid.heading).toBe('Nossos Serviços')
    expect(grid.intro).toBe('Equipe multidisciplinar.')
    expect(grid.services.map((s) => s.slug)).toEqual([
      'equoterapia',
      'hidroterapia',
    ])
    expect(grid.services[0]).toMatchObject({
      title: 'Equoterapia',
      excerpt: 'Método terapêutico.',
      to: '/servicos/equoterapia',
    })
  })
})

describe('selectHippussuit', () => {
  it('returns the intro paragraph, first-list highlights, and image override', () => {
    const h = selectHippussuit(content)
    expect(h.title).toBe('Hippussuit')
    expect(h.paragraphs).toEqual(['Intro do HippusSuit.'])
    expect(h.highlights).toEqual(['A', 'B', 'C', 'D'])
    expect(h.image).toEqual({
      src: '/images/hippussuit.jpg',
      alt: 'Hippussuit',
    })
  })
})
