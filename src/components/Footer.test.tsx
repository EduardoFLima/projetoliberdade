import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../test/render'
import type { NavItem, Site } from '../content/types'
import { Footer } from './Footer'

const site: Site = {
  name: 'Projeto Liberdade',
  logo: '/images/logo.png',
  social: [{ network: 'facebook', url: 'https://facebook.com/x' }],
}
const navigation: NavItem[] = [
  { slug: 'home', label: 'Home', order: 0 },
  { slug: 'historia', label: 'História', order: 1 },
  { slug: 'contato', label: 'Contato', order: 4 },
]

describe('Footer', () => {
  it('shows the site name, nav links and social links', () => {
    renderWithRouter(<Footer site={site} navigation={navigation} />)
    expect(screen.getByText('Projeto Liberdade')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'História' })).toHaveAttribute(
      'href',
      '/historia',
    )
    expect(screen.getByRole('link', { name: 'Facebook' })).toBeInTheDocument()
    expect(screen.getByTestId('site-footer')).toBeInTheDocument()
  })

  it('does not render Privacy or Terms links', () => {
    renderWithRouter(<Footer site={site} navigation={navigation} />)
    expect(screen.queryByText(/Privacy/i)).toBeNull()
    expect(screen.queryByText(/Terms/i)).toBeNull()
  })
})
