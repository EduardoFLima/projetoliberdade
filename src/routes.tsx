/* eslint-disable react-refresh/only-export-components -- route config file mixes a
   local NotFound component with the exported router config; not relevant for HMR */
import { createBrowserRouter } from 'react-router'
import { SiteLayout } from './layouts/SiteLayout'
import { PlaceholderPage } from './PlaceholderPage'

function NotFound() {
  return <p>404 — página não encontrada</p>
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: SiteLayout,
    children: [
      { index: true, Component: PlaceholderPage },
      { path: '*', Component: NotFound },
    ],
  },
])
