/* eslint-disable react-refresh/only-export-components -- route config file mixes a
   local NotFound component with the exported router config; not relevant for HMR */
import { createBrowserRouter } from 'react-router'
import { SiteLayout } from './layouts/SiteLayout'
import { HomePage } from './features/home/HomePage'
import { HistoriaPage } from './features/historia/HistoriaPage'
import { ServicosPage } from './features/servicos/ServicosPage'
import { StyleGuide } from './styleguide/StyleGuide'

function NotFound() {
  return <p>404 — página não encontrada</p>
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: SiteLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'historia', Component: HistoriaPage },
      { path: 'servicos', Component: ServicosPage },
      { path: 'estilo', Component: StyleGuide },
      { path: '*', Component: NotFound },
    ],
  },
])
