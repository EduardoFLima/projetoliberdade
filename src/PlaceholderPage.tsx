import { useContent } from './content/useContent'

/**
 * Temporary proof-of-life page. Confirms the content seam works end-to-end.
 * Replaced by the real pages (home, historia, …) in a later phase.
 */
export function PlaceholderPage() {
  const { content, loading, error } = useContent()

  if (loading) return <p>Carregando…</p>
  if (error)
    return (
      <p role="alert" className="text-red-600">
        Erro: {error.message}
      </p>
    )

  return (
    <section>
      <h1 data-testid="scaffold-heading" className="text-2xl font-bold">
        Scaffold OK — {content?.site.name}
      </h1>
      <p>{content?.navigation.length} itens de navegação carregados.</p>
    </section>
  )
}
