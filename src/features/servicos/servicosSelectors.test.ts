import { describe, expect, it } from 'vitest'
import type { SiteContent } from '../../content/types'
import { contentRepository } from '../../content/content'
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
          icon: 'equine-therapy',
          body: [{ type: 'paragraph', text: 'Método terapêutico.' }],
        },
        {
          slug: 'hidroterapia',
          title: 'Hidroterapia',
          order: 6,
          icon: 'pool',
          body: [{ type: 'paragraph', text: 'Terapia aquática.' }],
        },
        {
          slug: 'hippussuit',
          title: 'Hippussuit',
          order: 9,
          body: [
            { type: 'image', src: 'placeholder.jpg', alt: '' },
            { type: 'paragraph', text: 'Intro do HippusSuit.' },
            { type: 'heading', text: 'O que é' },
            { type: 'paragraph', text: 'É uma vestimenta.' },
            { type: 'heading', text: 'Como funciona' },
            { type: 'paragraph', text: 'Funciona assim.' },
            { type: 'heading', text: 'Nos aspectos motores' },
            { type: 'list', items: ['Motor A', 'Motor B'] },
            { type: 'heading', text: 'Os aspectos comportamentais' },
            { type: 'list', items: ['Comp 1'] },
            { type: 'paragraph', text: 'Fecho um.' },
            { type: 'paragraph', text: 'Fecho dois.' },
            { type: 'paragraph', text: 'Desenvolvido por:' },
            { type: 'list', items: ['Karina Hollatz', 'André'] },
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
      icon: 'equine-therapy',
    })
  })
})

describe('selectHippussuit', () => {
  it('maps blocks into the structured hippussuit layout', () => {
    const h = selectHippussuit(content)
    expect(h.title).toBe('Hippussuit')
    expect(h.image).toEqual({
      src: '/images/hippussuit.jpg',
      alt: 'Hippussuit',
    })
    expect(h.intro).toBe('Intro do HippusSuit.')
    expect(h.whatIsIt).toEqual({
      heading: 'O que é',
      text: 'É uma vestimenta.',
    })
    expect(h.howItWorks).toEqual({
      heading: 'Como funciona',
      text: 'Funciona assim.',
    })
    expect(h.motor).toEqual({
      heading: 'Nos aspectos motores',
      items: ['Motor A', 'Motor B'],
    })
    expect(h.behavioral).toEqual({
      heading: 'Os aspectos comportamentais',
      items: ['Comp 1'],
    })
    expect(h.closing).toEqual(['Fecho um.', 'Fecho dois.'])
    expect(h.developedBy).toEqual({
      label: 'Desenvolvido por:',
      items: ['Karina Hollatz', 'André'],
    })
  })

  it('pins the real content.json shape so block reordering fails loudly', async () => {
    const realContent = await contentRepository.getContent()
    const h = selectHippussuit(realContent)

    expect(h.title).toBe('Hippussuit')
    expect(h.whatIsIt.heading).toBe('O que é')
    expect(h.howItWorks.heading).toBe('Como funciona')
    expect(h.motor.heading).toBe('Nos aspectos motores')
    expect(h.behavioral.heading).toBe('Os aspectos comportamentais')
    expect(h.developedBy.items).toEqual([
      'Karina Hollatz – Fisioterapeuta',
      'André Augusto Amaral Gomes – Equitador/Educador Físico',
      'Cibele Ferreira Lima – Terapeuta Ocupacional',
      'Equipe do Centro de Equoterapia e Equitação Projeto Liberdade',
    ])
    expect(h.closing.length).toBeGreaterThan(0)
    expect(h.closing[0]).toContain(
      'órtese de retificação postural HippusSuit pode ser sugerido',
    )
  })
})
