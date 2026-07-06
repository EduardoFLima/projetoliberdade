import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { VideoGallery } from './VideoGallery'

const videos = [
  {
    slug: 'a',
    title: 'Vídeo A',
    thumbnail: 'https://img.youtube.com/vi/aaaaaaaaaaa/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/aaaaaaaaaaa',
    watchUrl: 'https://www.youtube.com/watch?v=aaaaaaaaaaa',
  },
  {
    slug: 'b',
    title: 'Vídeo B',
    thumbnail: 'https://img.youtube.com/vi/bbbbbbbbbbb/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/bbbbbbbbbbb',
    watchUrl: 'https://www.youtube.com/watch?v=bbbbbbbbbbb',
  },
]

describe('VideoGallery', () => {
  it('renders a card per video and opens the modal on play', () => {
    render(<VideoGallery videos={videos} />)
    expect(screen.getAllByRole('button', { name: /^Assistir:/ })).toHaveLength(
      2,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Assistir: Vídeo B' }))
    const dialog = screen.getByRole('dialog', { name: 'Vídeo B' })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByTitle('Vídeo B')).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/bbbbbbbbbbb?autoplay=1',
    )
  })
})
