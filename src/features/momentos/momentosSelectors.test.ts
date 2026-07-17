import { describe, expect, it } from 'vitest'
import type { SiteContent } from '../../content/types'
import { contentRepository } from '../../content/content'
import {
  momentosMeta,
  selectMomentosHeader,
  selectPhotos,
  selectVideos,
} from './momentosSelectors'

const content = {
  site: { name: 'Projeto Liberdade', logo: '/images/logo.png', social: [] },
  navigation: [],
  pages: {
    momentos: {
      slug: 'momentos',
      title: 'Momentos',
      header: { title: 'Nossos Momentos', subtitle: 'Sub texto.' },
      videos: [
        {
          slug: 'segundo',
          title: 'Segundo',
          order: 2,
          url: 'https://www.youtube.com/embed/RcaxtQWPI_c',
        },
        {
          slug: 'primeiro',
          title: 'Primeiro',
          order: 1,
          url: 'https://www.youtube.com/embed/bAkqnk5AqOc',
        },
      ],
    },
  },
} as unknown as SiteContent

describe('momentosSelectors', () => {
  it('selects the header title and subtitle', () => {
    expect(selectMomentosHeader(content)).toEqual({
      title: 'Nossos Momentos',
      subtitle: 'Sub texto.',
    })
  })

  it('returns videos sorted by order with derived urls', () => {
    const videos = selectVideos(content)
    expect(videos.map((v) => v.slug)).toEqual(['primeiro', 'segundo'])
    expect(videos[0]).toEqual({
      slug: 'primeiro',
      title: 'Primeiro',
      thumbnail: 'https://img.youtube.com/vi/bAkqnk5AqOc/hqdefault.jpg',
      embedUrl: 'https://www.youtube.com/embed/bAkqnk5AqOc',
      watchUrl: 'https://www.youtube.com/watch?v=bAkqnk5AqOc',
    })
  })
})

describe('selectPhotos', () => {
  const content = {
    pages: {
      momentos: {
        photos: {
          featured: { src: '/images/momentos/destaque.jpg', alt: 'destaque' },
          items: [
            { src: '/images/momentos/foto-1.jpg', alt: 'um' },
            { src: '/images/momentos/foto-2.jpg', alt: 'dois' },
          ],
        },
      },
    },
  } as unknown as SiteContent

  it('returns the featured photo first, then the items', () => {
    const photos = selectPhotos(content)
    expect(photos).toHaveLength(3)
    expect(photos[0].src).toBe('/images/momentos/destaque.jpg')
    expect(photos[1].alt).toBe('um')
    expect(photos[2].alt).toBe('dois')
  })
})

describe('momentosMeta', () => {
  it('derives title and description from content', async () => {
    const content = await contentRepository.getContent()
    const tags = momentosMeta(content)
    expect(tags).toContainEqual({ title: 'Momentos — Projeto Liberdade' })
  })

  it('falls back to the site title without content', () => {
    expect(momentosMeta(undefined)).toContainEqual({
      title: 'Projeto Liberdade',
    })
  })
})
