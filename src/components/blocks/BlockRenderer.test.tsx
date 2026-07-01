import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Block } from '../../content/types'
import { BlockRenderer } from './BlockRenderer'

const blocks: Block[] = [
  { type: 'heading', text: 'Missão' },
  { type: 'paragraph', text: 'Texto de missão.' },
  { type: 'list', items: ['Ética', 'Respeito'] },
  { type: 'image', src: '/img/x.jpg', alt: 'cavalo' },
  { type: 'quote', text: 'São 16 anos.', author: 'André' },
]

describe('BlockRenderer', () => {
  it('renders each block type with the right element', () => {
    render(<BlockRenderer blocks={blocks} />)
    expect(screen.getByRole('heading', { name: 'Missão' }).tagName).toBe('H2')
    expect(screen.getByText('Texto de missão.').tagName).toBe('P')
    expect(screen.getByText('Ética').closest('li')).not.toBeNull()
    expect(screen.getByRole('img', { name: 'cavalo' })).toHaveAttribute(
      'src',
      '/img/x.jpg',
    )
    expect(screen.getByText('São 16 anos.').closest('blockquote')).not.toBeNull()
    expect(screen.getByText('André')).toBeInTheDocument()
  })
})
