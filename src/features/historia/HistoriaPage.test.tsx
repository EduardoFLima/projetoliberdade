import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { SiteLayout } from '../../layouts/SiteLayout'
import { HistoriaPage } from './HistoriaPage'

function renderHistoria() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        Component: SiteLayout,
        children: [{ path: 'historia', Component: HistoriaPage }],
      },
    ],
    { initialEntries: ['/historia'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('HistoriaPage', () => {
  it('renders the page hero, narrative and MVV from content', async () => {
    renderHistoria()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Nossa História' }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Missão, Visão e Valores',
      }),
    ).toBeInTheDocument()
  })

  it('does not render a redundant "História" narrative heading', async () => {
    renderHistoria()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Nossa História' }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.queryByRole('heading', { level: 2, name: 'História' }),
    ).not.toBeInTheDocument()
  })
})
