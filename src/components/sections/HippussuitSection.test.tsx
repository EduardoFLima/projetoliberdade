import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HippussuitSection, type HippussuitContent } from './HippussuitSection'

afterEach(() => {
  vi.restoreAllMocks()
})

const hippussuit: HippussuitContent = {
  title: 'Hippussuit',
  image: { src: '/images/hippussuit.jpg', alt: 'Hippussuit' },
  intro: 'Intro do HippusSuit.',
  whatIsIt: { heading: 'O que é', text: 'É uma vestimenta.' },
  howItWorks: { heading: 'Como funciona', text: 'Funciona assim.' },
  motor: { heading: 'Nos aspectos motores', items: ['Motor A', 'Motor B'] },
  behavioral: { heading: 'Os aspectos comportamentais', items: ['Comp 1'] },
  closing: ['Fecho um.', 'Fecho dois.'],
  developedBy: {
    label: 'Desenvolvido por:',
    items: ['Karina Hollatz', 'André'],
  },
}

describe('HippussuitSection', () => {
  it('renders the title, editorial headings, both lists, and developer names', () => {
    render(<HippussuitSection hippussuit={hippussuit} />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'Hippussuit' }),
    ).toBeInTheDocument()
    for (const heading of [
      'O que é',
      'Como funciona',
      'Nos aspectos motores',
      'Os aspectos comportamentais',
    ]) {
      expect(
        screen.getByRole('heading', { level: 3, name: heading }),
      ).toBeInTheDocument()
    }
    expect(screen.getByText('Motor A')).toBeInTheDocument()
    expect(screen.getByText('Comp 1')).toBeInTheDocument()
    expect(screen.getByText('Fecho dois.')).toBeInTheDocument()
    expect(screen.getByText('Karina Hollatz')).toBeInTheDocument()
    // 2 motor + 1 behavioral + 2 developer = 5 list items
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    const img = screen.getByRole('img', { name: 'Hippussuit' })
    expect(img).toHaveAttribute('src', '/images/hippussuit.jpg')
  })

  it('is not highlighted by default', () => {
    const { container } = render(<HippussuitSection hippussuit={hippussuit} />)
    expect(container.querySelector('.border-cta')).toBeNull()
  })

  it('highlights and scrolls into view when active', () => {
    const scrollIntoViewMock = vi.fn()
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock

    const { container } = render(
      <HippussuitSection hippussuit={hippussuit} isActive />,
    )

    expect(container.querySelector('.border-cta')).not.toBeNull()
    expect(scrollIntoViewMock).toHaveBeenCalled()
  })
})
