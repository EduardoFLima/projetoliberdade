import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHero } from './PageHero'

const props = {
  image: '/images/historia-hero.jpg',
  alt: 'Sessão de equoterapia ao pôr do sol',
  title: 'Nossa História',
  subtitle: 'Terapia e reabilitação equestre desde 2006.',
}

describe('PageHero', () => {
  it('renders the title and subtitle', () => {
    render(<PageHero {...props} />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Nossa História' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Terapia e reabilitação equestre desde 2006.'),
    ).toBeInTheDocument()
  })

  it('exposes the background image via an accessible name', () => {
    render(<PageHero {...props} />)
    expect(
      screen.getByRole('img', { name: 'Sessão de equoterapia ao pôr do sol' }),
    ).toBeInTheDocument()
  })
})
