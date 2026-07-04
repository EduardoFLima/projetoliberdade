import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionHeading } from './SectionHeading'

describe('SectionHeading', () => {
  it('renders the title as a level-2 heading', () => {
    render(<SectionHeading title="História" />)
    expect(
      screen.getByRole('heading', { level: 2, name: 'História' }),
    ).toBeInTheDocument()
  })

  it('renders an intro paragraph when provided', () => {
    render(<SectionHeading title="Nossos Serviços" intro="Equipe multi." />)
    expect(screen.getByText('Equipe multi.')).toBeInTheDocument()
  })

  it('omits the intro when not provided', () => {
    const { container } = render(<SectionHeading title="História" />)
    expect(container.querySelector('p')).toBeNull()
  })

  it('renders the title as a level-1 heading when level="h1"', () => {
    render(<SectionHeading title="Nossos Serviços" level="h1" />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Nossos Serviços' }),
    ).toBeInTheDocument()
  })
})
