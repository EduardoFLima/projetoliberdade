import { describe, expect, it } from 'vitest'
import { JsonContentRepository } from './JsonContentRepository'
import type { HomeContent } from './types'

describe('JsonContentRepository', () => {
  it('loads site content from the bundled snapshot', async () => {
    const repo = new JsonContentRepository()
    const content = await repo.getContent()

    expect(content.site.name).toBe('Projeto Liberdade')
    expect(content.site.logo).toBe('/images/logo.png')
    expect(Array.isArray(content.navigation)).toBe(true)
    expect(content.navigation.length).toBeGreaterThan(0)

    const home = content.pages.home as HomeContent
    expect(home.hero).toMatchObject({
      image: '/images/hero.jpg',
      title: 'Reabilitação e Equoterapia',
    })
    expect(home.featuredServices).toEqual([
      'equoterapia',
      'equitacao-ludica',
      'equitacao-adaptada',
    ])
    expect('images' in home.hero).toBe(false)
  })
})
