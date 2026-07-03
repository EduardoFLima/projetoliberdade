import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import { Button } from './Button'

describe('Button', () => {
  it('renders a primary button by default', () => {
    render(<Button>Enviar</Button>)
    const btn = screen.getByRole('button', { name: 'Enviar' })
    expect(btn).toHaveAttribute('type', 'button')
    expect(btn.className).toContain('bg-cta')
    expect(btn.className).toContain('text-button')
  })

  it('renders the secondary outline variant', () => {
    render(<Button variant="secondary">Ler mais</Button>)
    const btn = screen.getByRole('button', { name: 'Ler mais' })
    expect(btn.className).toContain('border-secondary')
    expect(btn.className).toContain('text-secondary')
  })

  it('uses the strong fill for a compact primary button', () => {
    render(<Button compact>Ok</Button>)
    expect(screen.getByRole('button', { name: 'Ok' }).className).toContain(
      'bg-cta-strong',
    )
  })

  it('renders a router link when given "to"', () => {
    renderWithRouter(<Button to="/contato">Contato</Button>)
    const link = screen.getByRole('link', { name: 'Contato' })
    expect(link).toHaveAttribute('href', '/contato')
  })

  it('renders a rounded-full pill when pill is set', () => {
    render(<Button pill>Contato</Button>)
    const btn = screen.getByRole('button', { name: 'Contato' })
    expect(btn.className).toContain('rounded-full')
    expect(btn.className).not.toContain('rounded-md')
  })
})
