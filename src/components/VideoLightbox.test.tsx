import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { VideoLightbox } from './VideoLightbox'

const props = {
  title: 'O menino e seu cavalo',
  embedUrl: 'https://www.youtube.com/embed/bAkqnk5AqOc',
}

describe('VideoLightbox', () => {
  it('renders a dialog with an autoplaying iframe for the video', () => {
    render(<VideoLightbox {...props} onClose={() => {}} />)
    const dialog = screen.getByRole('dialog', { name: props.title })
    expect(dialog).toBeInTheDocument()
    const iframe = screen.getByTitle(props.title)
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/bAkqnk5AqOc?autoplay=1',
    )
  })

  it('calls onClose on Escape and on the close button', () => {
    const onClose = vi.fn()
    render(<VideoLightbox {...props} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
