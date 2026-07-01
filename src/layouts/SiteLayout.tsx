import { Outlet } from 'react-router'

/**
 * Shell layout: placeholder header + routed content + placeholder footer. Real
 * Header / Nav / Footer components are built in a later phase.
 */
export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header data-testid="site-header" className="border-b p-4">
        {/* TODO: real Header + Nav (later phase) */}
        <span className="font-semibold">Projeto Liberdade</span>
      </header>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      <footer data-testid="site-footer" className="border-t p-4">
        {/* TODO: real Footer + social links (later phase) */}
      </footer>
    </div>
  )
}
