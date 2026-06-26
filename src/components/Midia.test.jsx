import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Midia from './Midia'

const fotos = {
  albumList: {
    album1: {
      capa: { titulo: 'Álbum 1', src: 'fotos/album1/FB_IMG_1526582851926.jpg' },
      fotos: {
        foto1: { src: 'fotos/album1/FB_IMG_1526582851926.jpg', titulo: 'foto 1' },
      },
    },
  },
}

describe('Midia fotos', () => {
  it('renders album thumbnails from local public paths, not Firebase', () => {
    const { container } = render(<Midia fotos={fotos} videos={{}} />)
    const sources = [...container.querySelectorAll('img')].map((img) => img.getAttribute('src'))
    expect(sources).toContain('/fotos/album1/FB_IMG_1526582851926.jpg')
    expect(sources.every((src) => !src.includes('firebasestorage'))).toBe(true)
  })
})
