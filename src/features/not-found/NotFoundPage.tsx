import { pageMeta } from '../../lib/meta'

export function meta() {
  return pageMeta('Página não encontrada — Projeto Liberdade')
}

export default function NotFoundPage() {
  return <p className="p-4">404 — página não encontrada</p>
}
