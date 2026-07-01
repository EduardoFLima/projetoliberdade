import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Album } from '../content/types'
import { Gallery } from './Gallery'

const albums: Album[] = [
  {
    slug: 'reabilitacao',
    title: 'Reabilitação',
    cover: { src: '/a.jpg', alt: 'a' },
    photos: [
      { src: '/a.jpg', alt: 'foto a' },
      { src: '/b.jpg', alt: 'foto b', caption: 'Legenda B' },
    ],
  },
]

describe('Gallery', () => {
  it('renders album titles and thumbnails', () => {
    render(<Gallery albums={albums} />)
    expect(
      screen.getByRole('heading', { name: 'Reabilitação' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'foto a' })).toBeInTheDocument()
  })

  it('opens a lightbox dialog when a thumbnail is clicked', () => {
    render(<Gallery albums={albums} />)
    fireEvent.click(screen.getByRole('img', { name: 'foto b' }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Legenda B')).toBeInTheDocument()
  })
})
