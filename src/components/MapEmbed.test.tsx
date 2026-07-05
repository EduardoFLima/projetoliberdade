import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MapEmbed } from './MapEmbed'

describe('MapEmbed', () => {
  it('renders a lazy titled iframe with the given src', () => {
    render(
      <MapEmbed
        src="https://www.google.com/maps?q=test&output=embed"
        title="Mapa da unidade"
      />,
    )
    const frame = screen.getByTitle('Mapa da unidade')
    expect(frame.tagName).toBe('IFRAME')
    expect(frame).toHaveAttribute(
      'src',
      'https://www.google.com/maps?q=test&output=embed',
    )
    expect(frame).toHaveAttribute('loading', 'lazy')
  })
})
