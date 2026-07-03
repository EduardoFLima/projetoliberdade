import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import { ServicesSection } from './ServicesSection'

const services = [
  {
    slug: 'equoterapia',
    title: 'Equoterapia',
    excerpt: 'Método terapêutico.',
    to: '/servicos/equoterapia',
  },
  {
    slug: 'equitacao-ludica',
    title: 'Equitação Lúdica',
    excerpt: 'Para crianças.',
    to: '/servicos/equitacao-ludica',
  },
]

describe('ServicesSection', () => {
  it('renders one card per service with a link to its page', () => {
    renderWithRouter(
      <ServicesSection
        heading="Nossos Serviços"
        intro="Equipe."
        services={services}
      />,
    )
    expect(
      screen.getByRole('heading', { level: 3, name: 'Equoterapia' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Método terapêutico.')).toBeInTheDocument()
    const links = screen.getAllByRole('link', { name: /Ver mais/ })
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/servicos/equoterapia')
    expect(links[1]).toHaveAttribute('href', '/servicos/equitacao-ludica')
  })
})
