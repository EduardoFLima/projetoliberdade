import { Outlet, useLoaderData } from 'react-router'
import type { SiteContent } from '../content/types'
import { contentRepository } from '../content/content'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

/**
 * Route module for the site chrome. The loader is the single touchpoint on
 * the content repository (see the dependency rule): it resolves SiteContent
 * at build time for prerendered paths; the clientLoader covers paths hydrated
 * from the SPA fallback (unknown URLs rendered by the 404 route).
 *
 * `loader` and `clientLoader` are defined as separate functions (rather than
 * `clientLoader = loader`) because React Router's client bundle strips
 * server-only route exports like `loader` at build/dev time; aliasing would
 * leave `clientLoader` referencing a removed binding and throw at runtime for
 * any route reached only client-side (e.g. the SPA-fallback 404 route).
 */
export function loader(): Promise<SiteContent> {
  return contentRepository.getContent()
}

export function clientLoader(): Promise<SiteContent> {
  return contentRepository.getContent()
}

export function HydrateFallback() {
  return <p className="p-4">Carregando…</p>
}

export function ErrorBoundary() {
  return (
    <p role="alert" className="p-4 text-error">
      Erro ao carregar a página. Tente novamente mais tarde.
    </p>
  )
}

export default function SiteLayout() {
  const content = useLoaderData<typeof loader>()

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <Header site={content.site} navigation={content.navigation} />
      <main className="flex-1">
        <Outlet context={content} />
      </main>
      <Footer site={content.site} navigation={content.navigation} />
    </div>
  )
}
