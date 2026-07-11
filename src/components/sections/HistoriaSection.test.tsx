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

  it('omits the heading when none is provided', () => {
    renderWithRouter(<HistoriaSection paragraphs={['Só um parágrafo.']} />)
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
    expect(screen.getByText('Só um parágrafo.')).toBeInTheDocument()
  })

  it('left-aligns paragraphs by default', () => {
    renderWithRouter(<HistoriaSection paragraphs={['Texto.']} />)
    expect(screen.getByText('Texto.')).not.toHaveClass('text-justify')
  })

  it('justifies paragraphs when justify is set', () => {
    renderWithRouter(<HistoriaSection paragraphs={['Texto.']} justify />)
    expect(screen.getByText('Texto.')).toHaveClass('text-justify')
  })

  it('renders a pullquote when a quote is provided', () => {
    renderWithRouter(
      <HistoriaSection
        paragraphs={['Texto.']}
        quote={{ text: 'Dezesseis anos de dedicação.' }}
      />,
    )
    expect(screen.getByText('Dezesseis anos de dedicação.')).toBeInTheDocument()
  })
})
