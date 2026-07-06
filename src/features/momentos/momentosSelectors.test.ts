import { describe, expect, it } from 'vitest'
import type { SiteContent } from '../../content/types'
import { selectMomentosHeader, selectVideos } from './momentosSelectors'

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
