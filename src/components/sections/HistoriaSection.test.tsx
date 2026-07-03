import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import { HistoriaSection } from './HistoriaSection'

describe('HistoriaSection', () => {
  it('renders heading, paragraphs and image', () => {
    renderWithRouter(
      <HistoriaSection
        heading="História"
        paragraphs={['Primeiro parágrafo.', 'Segundo parágrafo.']}
        image={{ src: '/images/historia.jpg', alt: 'Fundadores' }}
      />,
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'História' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Primeiro parágrafo.')).toBeInTheDocument()
    expect(screen.getByText('Segundo parágrafo.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Fundadores' })).toHaveAttribute(
      'src',
      '/images/historia.jpg',
    )
  })

  it('renders the CTA link when provided', () => {
    renderWithRouter(
      <HistoriaSection
        heading="História"
        paragraphs={['Texto.']}
        cta={{ label: 'Conheça nossa história', to: '/historia' }}
      />,
    )
    expect(
      screen.getByRole('link', { name: 'Conheça nossa história' }),
    ).toHaveAttribute('href', '/historia')
  })

  it('omits image and CTA when not provided', () => {
    const { container } = renderWithRouter(
      <HistoriaSection heading="História" paragraphs={['Texto.']} />,
    )
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('a')).toBeNull()
  })
})
