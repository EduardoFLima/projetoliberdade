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
  secondaryCta: { label: 'Entre em Contato', to: '/contato' },
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

  it('links both CTAs to their routes', () => {
    renderWithRouter(<Hero {...props} />)
    expect(
      screen.getByRole('link', { name: 'Nossos Serviços' }),
    ).toHaveAttribute('href', '/servicos')
    expect(
      screen.getByRole('link', { name: 'Entre em Contato' }),
    ).toHaveAttribute('href', '/contato')
  })
})
