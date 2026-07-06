import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VideoCard } from './VideoCard'

const video = {
  slug: 'o-menino-e-seu-cavalo',
  title: 'O menino e seu cavalo',
  thumbnail: 'https://img.youtube.com/vi/bAkqnk5AqOc/hqdefault.jpg',
  embedUrl: 'https://www.youtube.com/embed/bAkqnk5AqOc',
  watchUrl: 'https://www.youtube.com/watch?v=bAkqnk5AqOc',
}

describe('VideoCard', () => {
  it('renders the title, thumbnail and a youtube link', () => {
    const { container } = render(<VideoCard video={video} onPlay={() => {}} />)
    expect(screen.getByText('O menino e seu cavalo')).toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      video.thumbnail,
    )
    const link = screen.getByRole('link', { name: /Assistir no YouTube/ })
    expect(link).toHaveAttribute('href', video.watchUrl)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener')
  })

  it('calls onPlay with the video when the play button is clicked', () => {
    const onPlay = vi.fn()
    render(<VideoCard video={video} onPlay={onPlay} />)
    screen
      .getByRole('button', { name: 'Assistir: O menino e seu cavalo' })
      .click()
    expect(onPlay).toHaveBeenCalledWith(video)
  })
})
