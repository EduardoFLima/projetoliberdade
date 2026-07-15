import { describe, expect, it } from 'vitest'
import { contentRepository } from '../../content/content'
import { meta } from './ServicosPage'
import type { SiteContent } from '../../content/types'

const args = (content: SiteContent, params: Record<string, string> = {}) =>
  ({
    matches: [undefined, { loaderData: content }],
    params,
  }) as unknown as Parameters<typeof meta>[0]

describe('ServicosPage meta', () => {
  it('uses the page title without a slug', async () => {
    const content = await contentRepository.getContent()
    expect(meta(args(content))).toContainEqual({
      title: 'Serviços — Projeto Liberdade',
    })
  })

  it('uses the service title for a slug', async () => {
    const content = await contentRepository.getContent()
    expect(meta(args(content, { slug: 'equoterapia' }))).toContainEqual({
      title: 'Equoterapia — Projeto Liberdade',
    })
  })

  it('uses the Hippussuit title for the hippussuit slug', async () => {
    const content = await contentRepository.getContent()
    expect(meta(args(content, { slug: 'hippussuit' }))).toContainEqual({
      title: 'Hippussuit — Projeto Liberdade',
    })
  })
})
