import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Container } from './Container'
import { Section } from './Section'

describe('layout primitives', () => {
  it('Container caps width and pads responsively', () => {
    render(<Container>inner</Container>)
    const el = screen.getByText('inner')
    expect(el.className).toContain('max-w-site')
    expect(el.className).toContain('md:px-16')
  })

  it('Section renders a <section> with vertical rhythm', () => {
    render(<Section>body</Section>)
    const el = screen.getByText('body')
    expect(el.tagName).toBe('SECTION')
    expect(el.className).toContain('md:py-20')
  })

  it('Section supports the muted tone', () => {
    render(<Section tone="muted">m</Section>)
    expect(screen.getByText('m').className).toContain('bg-surface-container-low')
  })
})
