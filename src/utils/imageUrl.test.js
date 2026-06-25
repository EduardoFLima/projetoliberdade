import { describe, it, expect } from 'vitest'
import { getImageUrl } from './imageUrl'

describe('getImageUrl', () => {
  it('prefixes a top-level path with the Vite base URL', () => {
    expect(getImageUrl('home/FB_IMG_1.jpg')).toBe('/home/FB_IMG_1.jpg')
  })

  it('preserves nested album path separators (no percent-encoding)', () => {
    expect(getImageUrl('fotos/album1/FB_IMG_2.jpg')).toBe('/fotos/album1/FB_IMG_2.jpg')
  })
})
