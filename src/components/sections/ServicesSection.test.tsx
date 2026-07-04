import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
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

function mockOverflow(isOverflowing: boolean) {
  vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(
    isOverflowing ? 200 : 100,
  )
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(100)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ServicesSection', () => {
  it('renders one card per service', () => {
    mockOverflow(false)
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
  })

  it('shows a "Ver mais" button only when the excerpt overflows, and expanding it reveals the full text', () => {
    mockOverflow(true)
    renderWithRouter(
      <ServicesSection heading="Nossos Serviços" services={services} />,
    )
    const buttons = screen.getAllByRole('button', { name: /Ver mais/ })
    expect(buttons).toHaveLength(2)

    fireEvent.click(buttons[0])

    expect(screen.getAllByRole('button', { name: /Ver mais/ })).toHaveLength(1)
  })

  it('does not show a "Ver mais" button when the excerpt fits', () => {
    mockOverflow(false)
    renderWithRouter(
      <ServicesSection heading="Nossos Serviços" services={services} />,
    )
    expect(
      screen.queryByRole('button', { name: /Ver mais/ }),
    ).not.toBeInTheDocument()
  })

  it('renders the heading as level 2 by default', () => {
    mockOverflow(false)
    renderWithRouter(
      <ServicesSection
        heading="Nossos Serviços"
        intro="Equipe."
        services={services}
      />,
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nossos Serviços' }),
    ).toBeInTheDocument()
  })

  it('renders the heading as level 1 when headingLevel="h1"', () => {
    mockOverflow(false)
    renderWithRouter(
      <ServicesSection
        heading="Nossos Serviços"
        intro="Equipe."
        services={services}
        headingLevel="h1"
      />,
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Nossos Serviços' }),
    ).toBeInTheDocument()
  })

  it('renders the heading as level 2 by default', () => {
    renderWithRouter(
      <ServicesSection
        heading="Nossos Serviços"
        intro="Equipe."
        services={services}
      />,
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nossos Serviços' }),
    ).toBeInTheDocument()
  })

  it('renders the heading as level 1 when headingLevel="h1"', () => {
    renderWithRouter(
      <ServicesSection
        heading="Nossos Serviços"
        intro="Equipe."
        services={services}
        headingLevel="h1"
      />,
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Nossos Serviços' }),
    ).toBeInTheDocument()
  })
})
