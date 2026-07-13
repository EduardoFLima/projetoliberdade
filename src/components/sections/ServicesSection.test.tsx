import { afterEach, describe, expect, it, vi } from 'vitest'
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

  it('on /servicos shows "Ver mais" as a Link to the service path only when the excerpt overflows', () => {
    mockOverflow(true)
    renderWithRouter(
      <ServicesSection heading="Nossos Serviços" services={services} />,
      { route: '/servicos' },
    )
    const links = screen.getAllByRole('link', { name: /Ver mais/ })
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/servicos/equoterapia')
  })

  it('does not show "Ver mais" on /servicos when the excerpt fits', () => {
    mockOverflow(false)
    renderWithRouter(
      <ServicesSection heading="Nossos Serviços" services={services} />,
      { route: '/servicos' },
    )
    expect(
      screen.queryByRole('link', { name: /Ver mais/ }),
    ).not.toBeInTheDocument()
  })

  it('clicking a card on /servicos navigates to the service path', () => {
    mockOverflow(false)
    renderWithRouter(
      <>
        <ServicesSection heading="Nossos Serviços" services={services} />
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

  it('clicking a card outside /servicos does not navigate', () => {
    mockOverflow(false)
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

  it('renders a "Ver mais" Link to the detail page on the home page (/)', () => {
    mockOverflow(true)
    renderWithRouter(
      <ServicesSection heading="Nossos Serviços" services={services} />,
      { route: '/' },
    )
    const links = screen.getAllByRole('link', { name: /Ver mais/ })
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/servicos/equoterapia')
  })

  it('automatically expands, highlights, and scrolls to the active card based on activeSlug', () => {
    mockOverflow(true)
    const scrollIntoViewMock = vi.fn()
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock

    renderWithRouter(
      <ServicesSection
        heading="Nossos Serviços"
        services={services}
        activeSlug="equoterapia"
      />,
      { route: '/servicos/equoterapia' },
    )

    // equoterapia is active, so it is already expanded and hides its
    // "Ver mais" link; only equitacao-ludica keeps one.
    const links = screen.getAllByRole('link', { name: /Ver mais/ })
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/servicos/equitacao-ludica')

    // Verify that scrollIntoView was called for the active card
    expect(scrollIntoViewMock).toHaveBeenCalled()

    // Verify visual highlight
    const equoterapiaCard = screen
      .getByRole('heading', { name: 'Equoterapia' })
      .closest('article')
    expect(equoterapiaCard?.getAttribute('class')).toContain('border-cta')
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

  it('renders a service icon per card with alternating tones', () => {
    mockOverflow(false)
    const { container } = renderWithRouter(
      <ServicesSection heading="Nossos Serviços" services={services} />,
    )
    const icons = container.querySelectorAll('[data-icon]')
    expect(icons).toHaveLength(2)
    expect(icons[0].getAttribute('data-tone')).toBe('green')
    expect(icons[1].getAttribute('data-tone')).toBe('purple')
  })
})
