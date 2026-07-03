import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import { Hero } from './Hero'

const props = {
  image: '/images/hero.jpg',
  alt: 'Criança na montaria',
  title: 'Reabilitação e Equoterapia',
  subtitle: 'Qualidade de vida.',
  logo: '/images/logo.png',
  logoAlt: 'Projeto Liberdade',
  primaryCta: { label: 'Nossos Serviços', to: '/servicos' },
}

describe('Hero', () => {
  it('renders the title, subtitle and logo', () => {
    renderWithRouter(<Hero {...props} />)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Reabilitação e Equoterapia',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Qualidade de vida.')).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Projeto Liberdade' }),
    ).toHaveAttribute('src', '/images/logo.png')
  })

  it('exposes the background image via an accessible name', () => {
    renderWithRouter(<Hero {...props} />)
    expect(
      screen.getByRole('img', { name: 'Criança na montaria' }),
    ).toBeInTheDocument()
  })

  it('links the primary CTA to its route', () => {
    renderWithRouter(<Hero {...props} />)
    expect(
      screen.getByRole('link', { name: 'Nossos Serviços' }),
    ).toHaveAttribute('href', '/servicos')
  })

  it('does not render a secondary contact CTA', () => {
    renderWithRouter(<Hero {...props} />)
    expect(
      screen.queryByRole('link', { name: /Entre em Contato/i }),
    ).not.toBeInTheDocument()
  })
})
