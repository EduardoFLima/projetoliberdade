import { describe, expect, it } from 'vitest'
import content from './content.json'

describe('navigation content', () => {
  it('exposes serviços as a top-level link with no submenu', () => {
    const servicos = content.navigation.find((n) => n.slug === 'servicos')
    expect(servicos).toBeDefined()
    expect(servicos).not.toHaveProperty('submenu')
  })

  it('keeps the momentos submenu', () => {
    const momentos = content.navigation.find((n) => n.slug === 'momentos')
    expect(momentos).toHaveProperty('submenu')
  })
})
