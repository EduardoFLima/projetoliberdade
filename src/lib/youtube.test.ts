import { describe, expect, it } from 'vitest'
import { getYouTubeId, thumbnailUrl, watchUrl, embedUrl } from './youtube'

describe('youtube util', () => {
  it('extracts the id from an /embed/ url', () => {
    expect(getYouTubeId('https://www.youtube.com/embed/bAkqnk5AqOc')).toBe(
      'bAkqnk5AqOc',
    )
  })

  it('extracts the id from a watch url', () => {
    expect(getYouTubeId('https://www.youtube.com/watch?v=RcaxtQWPI_c')).toBe(
      'RcaxtQWPI_c',
    )
  })

  it('extracts the id from a youtu.be url', () => {
    expect(getYouTubeId('https://youtu.be/bAkqnk5AqOc')).toBe('bAkqnk5AqOc')
  })

  it('returns null for a non-youtube url', () => {
    expect(getYouTubeId('https://example.com/video')).toBeNull()
  })

  it('builds thumbnail, watch and embed urls from an id', () => {
    expect(thumbnailUrl('bAkqnk5AqOc')).toBe(
      'https://img.youtube.com/vi/bAkqnk5AqOc/hqdefault.jpg',
    )
    expect(watchUrl('bAkqnk5AqOc')).toBe(
      'https://www.youtube.com/watch?v=bAkqnk5AqOc',
    )
    expect(embedUrl('bAkqnk5AqOc')).toBe(
      'https://www.youtube.com/embed/bAkqnk5AqOc',
    )
  })
})
