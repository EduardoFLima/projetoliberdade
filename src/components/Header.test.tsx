import { describe, expect, it } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithRouter } from '../test/render'
import type { NavItem, Site } from '../content/types'
import { Header } from './Header'

const site: Site = {
  name: 'Projeto Liberdade',
  logo: '/images/logo.png',
  social: [],
}
const navigation: NavItem[] = [
  { slug: 'home', label: 'Home', order: 0 },
  { slug: 'contato', label: 'Contato', order: 4 },
]

describe('Header', () => {
  it('renders the logo image with the site name as alt', () => {
    renderWithRouter(<Header site={site} navigation={navigation} />)
    expect(
      screen.getByRole('img', { name: 'Projeto Liberdade' }),
    ).toHaveAttribute('src', '/images/logo.png')
  })

  it('renders the contact CTA linking to /contato', () => {
    renderWithRouter(<Header site={site} navigation={navigation} />)
    expect(
      screen.getAllByRole('link', { name: /Entre em contato/ })[0],
    ).toHaveAttribute('href', '/contato')
  })

  it('opens the drawer when the burger is clicked', () => {
    renderWithRouter(<Header site={site} navigation={navigation} />)
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()
  })
})
