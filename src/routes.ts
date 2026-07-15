import {
  index,
  layout,
  route,
  type RouteConfig,
} from '@react-router/dev/routes'

export default [
  layout('layouts/SiteLayout.tsx', [
    index('features/home/HomePage.tsx'),
    route('historia', 'features/historia/HistoriaPage.tsx'),
    route('servicos/:slug?', 'features/servicos/ServicosPage.tsx'),
    route('momentos', 'features/momentos/MomentosPage.tsx'),
    route('momentos/videos', 'features/momentos/MomentosVideosRoute.tsx'),
    route('momentos/fotos', 'features/momentos/MomentosFotosRoute.tsx'),
    route('contato', 'features/contato/ContatoPage.tsx'),
    route('estilo', 'styleguide/StyleGuide.tsx'),
    route('*', 'features/not-found/NotFoundPage.tsx'),
  ]),
] satisfies RouteConfig
