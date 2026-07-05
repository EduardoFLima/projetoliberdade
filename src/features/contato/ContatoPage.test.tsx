import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { SiteLayout } from '../../layouts/SiteLayout'
import { ContatoPage } from './ContatoPage'

function renderContato() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        Component: SiteLayout,
        children: [{ path: 'contato', Component: ContatoPage }],
      },
    ],
    { initialEntries: ['/contato'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('ContatoPage', () => {
  it('renders hero, channels and units from content', async () => {
    renderContato()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Entre em Contato' }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'Fale Conosco' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nossas Unidades' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Unidade 1 - Serra' }),
    ).toBeInTheDocument()
  })
})
