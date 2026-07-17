import { describe, expect, it } from 'vitest'
import { heroSubtitle, pageMeta } from './meta'

describe('pageMeta', () => {
  it('builds title and Open Graph tags', () => {
    expect(pageMeta('História — Projeto Liberdade')).toEqual([
      { title: 'História — Projeto Liberdade' },
      { property: 'og:title', content: 'História — Projeto Liberdade' },
      { property: 'og:type', content: 'website' },
    ])
  })

  it('adds description tags when a description is given', () => {
    const tags = pageMeta('Título', 'Descrição da página')
    expect(tags).toContainEqual({
      name: 'description',
      content: 'Descrição da página',
    })
    expect(tags).toContainEqual({
      property: 'og:description',
      content: 'Descrição da página',
    })
  })
})

describe('heroSubtitle', () => {
  it('returns the hero subtitle when present', () => {
    expect(
      heroSubtitle({ slug: 'x', title: 'X', hero: { subtitle: 'Sub' } }),
    ).toBe('Sub')
  })

  it('returns undefined when the page has no hero', () => {
    expect(heroSubtitle({ slug: 'x', title: 'X' })).toBeUndefined()
  })

  it('returns undefined when the subtitle is not a string', () => {
    expect(
      heroSubtitle({ slug: 'x', title: 'X', hero: { subtitle: 42 } }),
    ).toBeUndefined()
  })
})
