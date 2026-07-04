import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import { ContactCta } from './ContactCta'

describe('ContactCta', () => {
  it('renders the heading, body and a contact link', () => {
    renderWithRouter(
      <ContactCta heading="Agende uma Avaliação" body="Venha nos conhecer." />,
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'Agende uma Avaliação' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Venha nos conhecer.')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Entre em contato/ }),
    ).toHaveAttribute('href', '/contato')
  })
})
