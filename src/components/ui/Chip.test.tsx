import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Chip } from './Chip'

describe('Chip', () => {
  it('renders its label with a rounded pill', () => {
    render(<Chip>Ética</Chip>)
    const chip = screen.getByText('Ética')
    expect(chip.className).toContain('rounded-full')
    expect(chip.className).toContain('bg-primary/10')
  })

  it('supports the secondary tone', () => {
    render(<Chip tone="secondary">Info</Chip>)
    expect(screen.getByText('Info').className).toContain('bg-secondary/10')
  })
})
