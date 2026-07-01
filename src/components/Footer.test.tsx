import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Site } from '../content/types'
import { Footer } from './Footer'

const site: Site = {
  name: 'Projeto Liberdade',
  logo: 'logo.png',
  social: [{ network: 'facebook', url: 'https://facebook.com/x' }],
}

describe('Footer', () => {
  it('shows the site name and social links', () => {
    render(<Footer site={site} />)
    expect(screen.getByText('Projeto Liberdade')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Facebook' })).toBeInTheDocument()
    expect(screen.getByTestId('site-footer')).toBeInTheDocument()
  })
})
