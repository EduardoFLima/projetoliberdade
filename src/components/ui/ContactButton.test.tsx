import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import { ContactButton } from './ContactButton'

describe('ContactButton', () => {
  it('links to /contato with the contact label', () => {
    renderWithRouter(<ContactButton />)
    const link = screen.getByRole('link', { name: /Entre em contato/ })
    expect(link).toHaveAttribute('href', '/contato')
  })

  it('forwards className', () => {
    renderWithRouter(<ContactButton className="hidden md:inline-flex" />)
    const link = screen.getByRole('link', { name: /Entre em contato/ })
    expect(link.getAttribute('class')).toContain('hidden')
  })
})
