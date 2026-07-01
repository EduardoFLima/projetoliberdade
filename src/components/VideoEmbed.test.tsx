import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Video } from '../content/types'
import { VideoEmbed } from './VideoEmbed'

const video: Video = {
  slug: 'o-projeto-liberdade',
  title: 'O projeto liberdade',
  order: 1,
  url: 'https://www.youtube.com/embed/RcaxtQWPI_c',
}

describe('VideoEmbed', () => {
  it('renders a titled 16:9 iframe and caption', () => {
    render(<VideoEmbed video={video} />)
    const frame = screen.getByTitle('O projeto liberdade')
    expect(frame.tagName).toBe('IFRAME')
    expect(frame).toHaveAttribute('src', video.url)
    expect(screen.getByText('O projeto liberdade')).toBeInTheDocument()
  })
})
