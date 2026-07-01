import { describe, expect, it } from 'vitest'
import { JsonContentRepository } from './JsonContentRepository'

describe('JsonContentRepository', () => {
  it('loads site content from the bundled snapshot', async () => {
    const repo = new JsonContentRepository()
    const content = await repo.getContent()

    expect(content.site.name).toBe('Projeto Liberdade')
    expect(Array.isArray(content.navigation)).toBe(true)
    expect(content.navigation.length).toBeGreaterThan(0)
    expect(content.pages.home).toBeDefined()
  })
})
