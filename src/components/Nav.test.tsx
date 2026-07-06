import { describe, expect, it } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import type { NavItem } from '../content/types'
import { renderWithRouter } from '../test/render'
import { Nav } from './Nav'

const items: NavItem[] = [
  { slug: 'home', label: 'Home', order: 0 },
  {
    slug: 'servicos',
    label: 'Serviços',
    order: 2,
    submenu: [{ slug: 'equoterapia', label: 'Equoterapia', order: 1 }],
  },
]

describe('Nav', () => {
  it('links Home to "/" and sorts by order', () => {
    renderWithRouter(<Nav items={items} />)
    expect(screen.getAllByRole('link', { name: 'Home' })[0]).toHaveAttribute(
      'href',
      '/',
    )
  })

  it('discloses a submenu on hover', () => {
    renderWithRouter(<Nav items={items} />)
    const trigger = screen.getByRole('link', { name: 'Serviços' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.mouseEnter(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getAllByRole('link', { name: 'Equoterapia' })[0],
    ).toHaveAttribute('href', '/servicos/equoterapia')
  })

  it('toggles the mobile menu', () => {
    renderWithRouter(<Nav items={items} />)
    const toggle = screen.getByRole('button', { name: 'Abrir menu' })
    fireEvent.click(toggle)
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
  })
})
