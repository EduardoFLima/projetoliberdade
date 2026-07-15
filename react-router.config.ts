import { readFileSync } from 'node:fs'
import type { Config } from '@react-router/dev/config'

interface ContentSnapshot {
  pages: { servicos: { sections?: { slug: string }[] } }
}

// Build config may read content.json directly; the dependency rule governs
// only the UI trees (features/components/layouts).
const content = JSON.parse(
  readFileSync(new URL('./src/content/content.json', import.meta.url), 'utf8'),
) as ContentSnapshot

const serviceSlugs = (content.pages.servicos.sections ?? []).map((s) => s.slug)

export default {
  appDirectory: 'src',
  ssr: false,
  prerender: [
    '/',
    '/historia',
    '/servicos',
    ...serviceSlugs.map((slug) => `/servicos/${slug}`),
    '/momentos',
    '/momentos/videos',
    '/momentos/fotos',
    '/contato',
    '/estilo',
  ],
} satisfies Config
