import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SectionHeading from './SectionHeading'

describe('SectionHeading', () => {
  it('renders its children as a level-2 heading', () => {
    render(<SectionHeading>Nossa História</SectionHeading>)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nossa História' })
    ).toBeInTheDocument()
  })

  it('applies the className to the wrapper for spacing', () => {
    const { container } = render(
      <SectionHeading className="mb-12">Contato</SectionHeading>
    )
    expect(container.firstChild).toHaveClass('mb-12')
  })
})
