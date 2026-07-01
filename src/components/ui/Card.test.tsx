import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('renders children in a rounded surface with level-1 shadow', () => {
    render(<Card>conteúdo</Card>)
    const card = screen.getByText('conteúdo')
    expect(card.tagName).toBe('DIV')
    expect(card.className).toContain('rounded-lg')
    expect(card.className).toContain('shadow-level1')
  })

  it('uses level-2 shadow when elevated', () => {
    render(<Card elevated>x</Card>)
    expect(screen.getByText('x').className).toContain('shadow-level2')
  })

  it('renders as the given element', () => {
    render(<Card as="section">y</Card>)
    expect(screen.getByText('y').tagName).toBe('SECTION')
  })
})
