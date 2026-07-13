import { describe, expect, it } from 'vitest'
import content from './content.json'

describe('navigation content', () => {
  it('exposes serviços with a Hippussuit submenu entry', () => {
    const servicos = content.navigation.find((n) => n.slug === 'servicos')
    expect(servicos).toBeDefined()
    expect(servicos?.submenu).toEqual([
      { slug: 'hippussuit', label: 'Hippussuit', order: 1 },
    ])
  })

  it('keeps the momentos submenu', () => {
    const momentos = content.navigation.find((n) => n.slug === 'momentos')
    expect(momentos).toHaveProperty('submenu')
  })
})
