import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import {
  createMemoryRouter,
  RouterProvider,
  useOutletContext,
} from 'react-router'
import type { SiteContent } from '../content/types'
import { SiteLayout } from './SiteLayout'

function ContextProbe() {
  const content = useOutletContext<SiteContent>()
  return <p>página de {content.site.name}</p>
}

function renderLayout() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        Component: SiteLayout,
        children: [{ index: true, Component: ContextProbe }],
      },
    ],
    { initialEntries: ['/'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('SiteLayout', () => {
  it('renders the real header and footer from content', async () => {
    renderLayout()
    await waitFor(() =>
      expect(screen.getByTestId('site-header')).toBeInTheDocument(),
    )
    expect(screen.getByTestId('site-footer')).toBeInTheDocument()

    expect(
      screen.getByRole('navigation', { name: 'Principal' }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'História' }).length,
    ).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Facebook' })).toBeInTheDocument()
  })

  it('passes content to the outlet', async () => {
    renderLayout()
    await waitFor(() =>
      expect(
        screen.getByText('página de Projeto Liberdade'),
      ).toBeInTheDocument(),
    )
  })
})
