import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { MediaToggle } from './MediaToggle'

describe('MediaToggle', () => {
  it('marks the active pill with aria-current and links both views', () => {
    render(
      <MemoryRouter>
        <MediaToggle active="videos" />
      </MemoryRouter>,
    )
    const videos = screen.getByRole('link', { name: 'Vídeos' })
    expect(videos).toHaveAttribute('href', '/momentos/videos')
    expect(videos).toHaveAttribute('aria-current', 'page')

    const fotos = screen.getByRole('link', { name: 'Fotos' })
    expect(fotos).toHaveAttribute('href', '/momentos/fotos')
    expect(fotos).not.toHaveAttribute('aria-current')
  })

  it('marks Fotos active when active="fotos"', () => {
    render(
      <MemoryRouter>
        <MediaToggle active="fotos" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Fotos' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Vídeos' })).not.toHaveAttribute(
      'aria-current',
    )
  })
})
