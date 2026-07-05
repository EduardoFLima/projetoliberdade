import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SocialLinks } from './SocialLinks'

const links = [
  { network: 'facebook', url: 'https://facebook.com/x' },
  { network: 'instagram', url: 'https://instagram.com/x' },
]

describe('SocialLinks', () => {
  it('renders an external, labelled link per network', () => {
    render(<SocialLinks links={links} />)
    const fb = screen.getByRole('link', { name: 'Facebook' })
    expect(fb).toHaveAttribute('href', 'https://facebook.com/x')
    expect(fb).toHaveAttribute('target', '_blank')
    expect(fb).toHaveAttribute('rel', 'noreferrer')
    expect(screen.getByRole('link', { name: 'Instagram' })).toBeInTheDocument()
  })

  it('renders circular button styling in the buttons variant', () => {
    render(<SocialLinks links={links} variant="buttons" />)
    const fb = screen.getByRole('link', { name: 'Facebook' })
    expect(fb.className).toContain('rounded-full')
    expect(fb.className).toContain('text-primary')
    expect(fb).toHaveAttribute('href', 'https://facebook.com/x')
  })
})
