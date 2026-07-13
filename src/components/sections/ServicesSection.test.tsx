import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { useLocation } from 'react-router'
import { renderWithRouter } from '../../test/render'
import { ServicesSection } from './ServicesSection'

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="pathname">{location.pathname}</output>
}

const services = [
  {
    slug: 'equoterapia',
    title: 'Equoterapia',
    excerpt: 'Método terapêutico.',
    to: '/servicos/equoterapia',
    icon: 'equine-therapy',
  },
  {
    slug: 'equitacao-ludica',
    title: 'Equitação Lúdica',
    excerpt: 'Para crianças.',
    to: '/servicos/equitacao-ludica',
    icon: 'playful-riding',
  },
]

// jsdom does not implement scrollIntoView
const scrollIntoViewMock = vi.fn()

beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock
})

afterEach(() => {
  scrollIntoViewMock.mockClear()
  vi.restoreAllMocks()
})

describe('ServicesSection', () => {
  it('renders one card per service', () => {
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

  it('always renders a "Ver mais" Link to the detail page', () => {
    renderWithRouter(
      <ServicesSection heading="Nossos Serviços" services={services} />,
    )
    const links = screen.getAllByRole('link', { name: /Ver mais/ })
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/servicos/equoterapia')
  })

  it('when selectable, hides "Ver mais" only on the active card', () => {
    renderWithRouter(
      <ServicesSection
        heading="Nossos Serviços"
        services={services}
        activeSlug="equoterapia"
        selectable
      />,
      { route: '/servicos/equoterapia' },
    )
    const links = screen.getAllByRole('link', { name: /Ver mais/ })
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/servicos/equitacao-ludica')
  })

  it('when selectable, clicking a card navigates to the service path', () => {
    renderWithRouter(
      <>
        <ServicesSection
          heading="Nossos Serviços"
          services={services}
          selectable
        />
        <LocationProbe />
      </>,
      { route: '/servicos' },
    )

    const card = screen
      .getByRole('heading', { name: 'Equitação Lúdica' })
      .closest('article')!
    fireEvent.click(card)

    expect(screen.getByTestId('pathname')).toHaveTextContent(
      '/servicos/equitacao-ludica',
    )
  })

  it('without selectable, clicking a card does not navigate', () => {
    renderWithRouter(
      <>
        <ServicesSection heading="Nossos Serviços" services={services} />
        <LocationProbe />
      </>,
      { route: '/' },
    )

    const card = screen
      .getByRole('heading', { name: 'Equitação Lúdica' })
      .closest('article')!
    fireEvent.click(card)

    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/$/)
  })

  it('expands, highlights, marks aria-current, and scrolls to the active card', () => {
    renderWithRouter(
      <ServicesSection
        heading="Nossos Serviços"
        services={services}
        activeSlug="equoterapia"
        selectable
      />,
      { route: '/servicos/equoterapia' },
    )

    expect(scrollIntoViewMock).toHaveBeenCalled()

    const equoterapiaCard = screen
      .getByRole('heading', { name: 'Equoterapia' })
      .closest('article')!
    expect(equoterapiaCard.getAttribute('class')).toContain('border-cta')
    expect(equoterapiaCard).toHaveAttribute('aria-current', 'true')
    // The active card drops the clamp so the full text shows
    expect(
      equoterapiaCard.querySelector('p')?.getAttribute('class'),
    ).not.toContain('line-clamp')

    const otherCard = screen
      .getByRole('heading', { name: 'Equitação Lúdica' })
      .closest('article')!
    expect(otherCard).not.toHaveAttribute('aria-current')
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

  it('renders a service icon per card with alternating tones', () => {
    const { container } = renderWithRouter(
      <ServicesSection heading="Nossos Serviços" services={services} />,
    )
    const icons = container.querySelectorAll('[data-icon]')
    expect(icons).toHaveLength(2)
    expect(icons[0].getAttribute('data-tone')).toBe('green')
    expect(icons[1].getAttribute('data-tone')).toBe('purple')
  })
})
