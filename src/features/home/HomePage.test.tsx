import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithSiteLayout } from '../../test/render'
import { HomePage } from './HomePage'

function renderHome() {
  return renderWithSiteLayout([{ index: true, Component: HomePage }])
}

describe('HomePage', () => {
  it('composes hero and all sections from content', async () => {
    renderHome()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Reabilitação e Equoterapia',
        }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'História' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Missão, Visão e Valores',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nossos Serviços' }),
    ).toBeInTheDocument()
  })

  it('renders the featured services in order', async () => {
    renderHome()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 3, name: 'Equoterapia' }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByRole('heading', { level: 3, name: 'Equitação Lúdica' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Equitação Adaptada' }),
    ).toBeInTheDocument()
  })
})
