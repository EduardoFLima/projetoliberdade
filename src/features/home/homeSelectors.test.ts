import { describe, expect, it } from 'vitest'
import type { SiteContent } from '../../content/types'
import {
  selectHero,
  selectHistoria,
  selectMvv,
  selectServices,
} from './homeSelectors'

const content = {
  site: { name: 'Projeto Liberdade', logo: '/images/logo.png', social: [] },
  navigation: [],
  pages: {
    home: {
      slug: 'home',
      title: 'Home',
      hero: {
        image: '/images/hero.jpg',
        alt: 'alt',
        title: 'Reabilitação e Equoterapia',
        subtitle: 'sub',
      },
      featuredServices: ['equoterapia', 'equitacao-ludica'],
    },
    historia: {
      slug: 'historia',
      title: 'História',
      body: [
        { type: 'image', src: '/images/historia.jpg', alt: 'Fundadores' },
        { type: 'paragraph', text: 'P1' },
        { type: 'paragraph', text: 'P2' },
        { type: 'paragraph', text: 'P3' },
        { type: 'quote', text: 'Q' },
      ],
      sections: [
        {
          slug: 'missao-visao-valores',
          title: 'Missão, Visão e Valores',
          body: [{ type: 'heading', text: 'Missão' }],
        },
      ],
    },
    servicos: {
      slug: 'servicos',
      title: 'Serviços',
      body: [{ type: 'paragraph', text: 'Equipe multidisciplinar.' }],
      sections: [
        {
          slug: 'equoterapia',
          title: 'Equoterapia',
          icon: 'equine-therapy',
          body: [{ type: 'paragraph', text: 'Método.' }],
        },
        {
          slug: 'equitacao-ludica',
          title: 'Equitação Lúdica',
          body: [{ type: 'paragraph', text: 'Lúdica.' }],
        },
        {
          slug: 'equitacao-classica',
          title: 'Equitação Clássica',
          body: [{ type: 'paragraph', text: 'Clássica.' }],
        },
      ],
    },
  },
} as unknown as SiteContent

describe('homeSelectors', () => {
  it('selectHero returns the hero block', () => {
    expect(selectHero(content).title).toBe('Reabilitação e Equoterapia')
  })

  it('selectHistoria returns first image and first two paragraphs', () => {
    const h = selectHistoria(content)
    expect(h.heading).toBe('História')
    expect(h.paragraphs).toEqual(['P1', 'P2'])
    expect(h.image).toEqual({ src: '/images/historia.jpg', alt: 'Fundadores' })
  })

  it('selectMvv returns the MVV section body', () => {
    const m = selectMvv(content)
    expect(m.heading).toBe('Missão, Visão e Valores')
    expect(m.body).toHaveLength(1)
  })

  it('selectServices resolves featured services in order with excerpts', () => {
    const s = selectServices(content)
    expect(s.heading).toBe('Nossos Serviços')
    expect(s.intro).toBe('Equipe multidisciplinar.')
    expect(s.services.map((x) => x.slug)).toEqual([
      'equoterapia',
      'equitacao-ludica',
    ])
    expect(s.services[0]).toMatchObject({
      title: 'Equoterapia',
      excerpt: 'Método.',
      to: '/servicos/equoterapia',
      icon: 'equine-therapy',
    })
  })
})
