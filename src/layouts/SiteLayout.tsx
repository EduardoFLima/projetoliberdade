import { Outlet } from 'react-router'
import { useContent } from '../content/useContent'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

/**
 * Container for the site chrome: calls useContent once and passes site +
 * navigation down as props, and the full content to the routed page via the
 * Outlet context. Presentational components never call the hook.
 */
export function SiteLayout() {
  const { content, loading, error } = useContent()

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      {content ? (
        <Header site={content.site} navigation={content.navigation} />
      ) : null}
      <main className="flex-1">
        {loading ? <p className="p-4">Carregando…</p> : null}
        {error ? (
          <p role="alert" className="p-4 text-error">
            Erro: {error.message}
          </p>
        ) : null}
        {content ? <Outlet context={content} /> : null}
      </main>
      {content ? (
        <Footer site={content.site} navigation={content.navigation} />
      ) : null}
    </div>
  )
}
