import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../test/render'
import { StyleGuide } from './StyleGuide'

describe('StyleGuide', () => {
  it('renders the styleguide heading and a sample button', () => {
    renderWithRouter(<StyleGuide />)
    expect(screen.getByRole('heading', { name: /Estilo/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Primário' })).toBeInTheDocument()
  })
})
