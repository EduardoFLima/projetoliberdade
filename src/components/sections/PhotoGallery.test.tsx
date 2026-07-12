import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PhotoGallery } from './PhotoGallery'

const photos = [
  { src: '/images/momentos/destaque.jpg', alt: 'Destaque' },
  { src: '/images/momentos/foto-1.jpg', alt: 'Foto um' },
  { src: '/images/momentos/foto-2.jpg', alt: 'Foto dois' },
]

describe('PhotoGallery', () => {
  it('renders one tile per photo and no lightbox initially', () => {
    render(<PhotoGallery photos={photos} />)
    expect(
      screen.getAllByRole('button', { name: /^Ampliar foto:/ }),
    ).toHaveLength(3)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the lightbox at the clicked photo', () => {
    render(<PhotoGallery photos={photos} />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Ampliar foto: Foto dois' }),
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    // Scope to dialog to avoid matching the thumbnail in the gallery
    const img = screen
      .getAllByAltText('Foto dois')
      .find((el) => dialog.contains(el))
    expect(img).toBeInTheDocument()
  })

  it('closes the lightbox via the close button', () => {
    render(<PhotoGallery photos={photos} />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Ampliar foto: Foto um' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
