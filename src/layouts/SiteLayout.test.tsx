import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { SiteLayout } from './SiteLayout'

function renderLayout() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        Component: SiteLayout,
        children: [{ index: true, Component: () => <p>página</p> }],
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
    expect(screen.getByText('página')).toBeInTheDocument()

    expect(
      screen.getByRole('navigation', { name: 'Principal' }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'História' }).length,
    ).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Facebook' })).toBeInTheDocument()
  })
})
