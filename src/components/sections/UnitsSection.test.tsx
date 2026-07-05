import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UnitsSection } from './UnitsSection'

const units = [
  {
    slug: 'serra',
    label: 'Unidade 1 - Serra',
    venue: 'Haras Liberdade - Serra',
    addressLines: ['R. Flôr da Penha, 916', 'Bela Vista', 'Mairiporã - SP'],
    mapEmbedSrc: 'https://www.google.com/maps?q=serra&output=embed',
    mapLinkHref: 'https://www.google.com/maps/search/?api=1&query=serra',
  },
  {
    slug: 'sao-paulo',
    label: 'Unidade 2 - São Paulo',
    addressLines: ['Av. Nova Cantareira, 4775', 'Tremembé', 'São Paulo - SP'],
    mapEmbedSrc: 'https://www.google.com/maps?q=sp&output=embed',
    mapLinkHref: 'https://www.google.com/maps/search/?api=1&query=sp',
  },
]

describe('UnitsSection', () => {
  it('renders a card with map and external link per unit', () => {
    render(
      <UnitsSection
        heading="Nossas Unidades"
        subtitle="Encontre o espaço."
        units={units}
      />,
    )

    expect(
      screen.getByRole('heading', { level: 2, name: 'Nossas Unidades' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Unidade 1 - Serra' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Haras Liberdade - Serra')).toBeInTheDocument()

    expect(screen.getByTitle('Mapa - Unidade 1 - Serra')).toHaveAttribute(
      'src',
      'https://www.google.com/maps?q=serra&output=embed',
    )

    const links = screen.getAllByRole('link', { name: /Ver no mapa/ })
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=serra',
    )
    expect(links[0]).toHaveAttribute('target', '_blank')
    expect(links[0]).toHaveAttribute('rel', 'noreferrer')
  })
})
