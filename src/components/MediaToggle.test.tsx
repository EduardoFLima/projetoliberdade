import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { MediaToggle } from './MediaToggle'

describe('MediaToggle', () => {
  it('renders Vídeos as the active link and Fotos as a disabled button', () => {
    render(
      <MemoryRouter>
        <MediaToggle active="videos" />
      </MemoryRouter>,
    )
    const videos = screen.getByRole('link', { name: 'Vídeos' })
    expect(videos).toHaveAttribute('href', '/momentos/videos')
    expect(videos).toHaveAttribute('aria-current', 'page')

    const fotos = screen.getByRole('button', { name: 'Fotos' })
    expect(fotos).toBeDisabled()
  })
})
