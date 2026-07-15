import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import {
  createMemoryRouter,
  MemoryRouter,
  RouterProvider,
  type RouteObject,
} from 'react-router'
import { SiteLayout } from '../layouts/SiteLayout'

export function renderWithRouter(ui: ReactElement, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

/** Mounts routes as children of SiteLayout, the way the app composes pages. */
export function renderWithSiteLayout(
  children: RouteObject[],
  { route = '/' } = {},
) {
  const router = createMemoryRouter(
    [{ path: '/', Component: SiteLayout, children }],
    { initialEntries: [route] },
  )
  return render(<RouterProvider router={router} />)
}
