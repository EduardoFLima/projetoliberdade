import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { SiteLayout } from '../../layouts/SiteLayout'
import { HomePage } from './HomePage'

function renderHome() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        Component: SiteLayout,
        children: [{ index: true, Component: HomePage }],
      },
    ],
    { initialEntries: ['/'] },
  )
  return render(<RouterProvider router={router} />)
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
