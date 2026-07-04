import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeatureSpotlight } from './FeatureSpotlight'

describe('FeatureSpotlight', () => {
  it('renders title, paragraphs, image, and one item per highlight', () => {
    render(
      <FeatureSpotlight
        title="Hippussuit"
        paragraphs={['Vestimenta dinâmica.']}
        highlights={['Favorece a postura', 'Melhora o equilíbrio']}
        image={{ src: '/images/hippussuit.jpg', alt: 'Hippussuit' }}
      />,
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'Hippussuit' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Vestimenta dinâmica.')).toBeInTheDocument()
    const img = screen.getByRole('img', { name: 'Hippussuit' })
    expect(img).toHaveAttribute('src', '/images/hippussuit.jpg')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Favorece a postura')).toBeInTheDocument()
  })
})
